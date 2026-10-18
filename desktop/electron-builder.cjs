'use strict';
const signing=require('./signing.json');
module.exports={
  appId:'com.lolite.os',productName:'Lolite OS',executableName:'Lolite OS',
  directories:{output:'dist',buildResources:'build'},
  files:['src/**','launcher/**','web/**','build/icon.png','package.json','signing.json'],
  asar:true,npmRebuild:false,compression:'normal',
  afterSign:'scripts/after-sign.cjs',
  win:{target:[{target:'nsis',arch:['x64']}],icon:'build/icon.ico',artifactName:'LoliteOS-Setup.exe',requestedExecutionLevel:'asInvoker',
    ...(signing.publisher?{signtoolOptions:{publisherName:signing.publisher},forceCodeSigning:true}:{verifyUpdateCodeSignature:false})},
  nsis:{oneClick:false,perMachine:false,allowElevation:false,allowToChangeInstallationDirectory:true,createDesktopShortcut:true,createStartMenuShortcut:true,shortcutName:'Lolite OS',uninstallDisplayName:'Lolite OS and Launcher',installerIcon:'build/icon.ico',uninstallerIcon:'build/icon.ico',deleteAppDataOnUninstall:false,runAfterFinish:true,include:'installer/custom.nsh'},
  publish:null
};
