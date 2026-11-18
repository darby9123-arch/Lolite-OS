import { withSupabase } from "npm:@supabase/server@^1";

const limits = new Map<string, { count: number; start: number }>();
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (data: unknown, status=200) =>
  Response.json(data, { status, headers: { ...cors, "Cache-Control": "no-store" } });

export default {
  fetch: withSupabase({ auth: "publishable" }, async (req, ctx) => {
    if (req.method === "OPTIONS") return new Response(null, { status:204, headers:cors });
    if (req.method !== "POST") return reply({error:"POST required"},405);
    const ip = (req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
    const now=Date.now(), prev=limits.get(ip);
    if (!prev || now-prev.start>3600000) limits.set(ip,{count:1,start:now});
    else if (++prev.count>12) return reply({error:"Too many account creation attempts. Please try again later."},429);
    let body:Record<string,unknown>;
    try { body=await req.json() } catch { return reply({error:"Invalid request body."},400) }
    if (body.action !== "register") return reply({error:"Unsupported action."},400);
    const username=String(body.username||"").trim().toLowerCase();
    const displayName=String(body.display_name||username).trim().slice(0,32);
    const password=String(body.password||"");
    const deviceId=String(body.device_id||"").trim().toLowerCase();
    // Opaque UUID created once by Lolite for this browser. Do not use IP-based
    // restrictions here: schools, families and public networks share IPs.
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(deviceId))
      return reply({error:"Could not verify this browser for signup. Reload Lolite and try again."},400);
    const {data:existingDevice,error:deviceLookupError}=await ctx.supabaseAdmin
      .from("lolite_account_registration_devices").select("user_id").eq("device_id",deviceId).maybeSingle();
    if(deviceLookupError)return reply({error:"Could not verify account limits right now. Please retry."},503);
    if(existingDevice)return reply({error:"This browser already created a Lolite account. Sign in instead."},409);
    if(!/^[a-z0-9_]{3,24}$/.test(username)) return reply({error:"Usernames must be 3–24 letters, numbers or underscores."},400);
    if(!displayName) return reply({error:"Enter a display name."},400);
    if(password.length<10||password.length>72) return reply({error:"Choose a password containing 10–72 characters."},400);
    const {data:exists,error:lookupError}=await ctx.supabaseAdmin.from("profiles").select("id").eq("username",username).maybeSingle();
    if(lookupError) return reply({error:"Could not check username right now."},503);
    if(exists) return reply({error:"Username is already taken."},409);
    // This address is an internal login identifier only, never an actual email account.
    // email_confirm bypasses email verification because users don't supply an email.
    const email=username+"@accounts.lolite.chat";
    const {data:created,error:err}=await ctx.supabaseAdmin.auth.admin.createUser({
      email,password,email_confirm:true,
      user_metadata:{username,display_name:displayName,account_type:"password"}
    });
    if(err||!created.user) {
      const text=String(err?.message||"Could not create an account.");
      return reply({error:/already been registered|already exists/i.test(text)?"Username is already taken.":"Could not create an account. Please try again."},409);
    }
    // The unique database key serializes competing requests from one browser.
    // If a second request wins the race, remove only the newly created account
    // so the rejected request cannot leave behind a usable duplicate.
    const {error:claimError}=await ctx.supabaseAdmin.from("lolite_account_registration_devices")
      .insert({device_id:deviceId,user_id:created.user.id});
    if(claimError){
      const {error:cleanupError}=await ctx.supabaseAdmin.auth.admin.deleteUser(created.user.id);
      if(cleanupError)console.error("Lolite signup rollback failed:",cleanupError.message);
      return reply({error:claimError.code==="23505"
        ?"This browser already created a Lolite account. Sign in instead."
        :"Could not finish creating your account. Please retry."},claimError.code==="23505"?409:503);
    }
    return reply({ok:true,username,user_id:created.user.id},201);
  })
};
