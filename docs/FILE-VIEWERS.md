# Lolite File Explorer and viewers (3.14)

Files stay in browser IndexedDB. Import or drag local files into a normal folder. Double-click opens the appropriate viewer. The top-right Open with selector allows text/media/image alternatives and file information. Browser permissions do not allow unrestricted access to a computer's disk.

## Compatibility — implementation, not an extension whitelist

| Formats | Implementation | Limitations |
| --- | --- | --- |
| MP4, WebM, MOV, MKV, AVI, M4V, MPEG/MPG, WMV, FLV, 3GP, TS/MTS/M2TS | HTML video with controls, seeking, volume, speed, fullscreen, SRT/VTT tracks and conditional picture-in-picture | **Conditional:** browser/container/codec dependent. AVI, WMV and FLV commonly need external conversion. A decode failure displays an explanation and original Download remains available. TS opens as code by default; choose Video in Open with for transport streams. No built-in video transcoder. |
| MP3, WAV, AAC, M4A, FLAC, OGG, OPUS, WMA, AIFF | HTML audio, library playlist, repeat, shuffle, volume and opt-in Web Audio spectrum | **Conditional:** browser codec dependent. WMA/AIFF may need conversion. Artwork uses a matching image/cover/folder image in the same folder; embedded ID3 artwork is not parsed. |
| MIDI/MID | Dedicated worker parses Standard MIDI formats 0/1 and PPQ timing; Web Audio synthesizes notes | Basic tones, not General MIDI instruments, percussion fidelity or full controller emulation. Format 2 and SMPTE timing rejected explicitly. |
| JPG/JPEG, PNG, GIF, WebP, BMP, SVG, ICO, AVIF | Browser image decoding; zoom, rotate, flip, grayscale, fullscreen, slideshow, PNG export | Encoding support varies by browser. Original animation is displayed, but edited exports are a single frame. SVG is loaded in image context, not inserted into the document. |
| TIFF/TIF | UTIF decoder in worker, renders first page | 20 MB input, 25 megapixels. Optional decoder needs internet; unsupported TIFF variants produce an error. |
| HEIC/HEIF | heic2any decoder converts a preview to PNG | 20 MB input; first image only; codec/library compatibility varies. Original is untouched. |
| PDF | PDF.js worker, page canvas, page navigation, zoom, search, selectable-text mode | Selectable text is a separate page-text view, not an aligned overlay. Scanned pages require OCR elsewhere. Password prompt supported. Print/native viewer opens original PDF in a browser tab. |
| TXT and code (JS/JSX, TS/TSX, HTML, CSS, Python, Java, C/C++, C#, PHP, SQL, YAML, TOML, LOG, INI, JSON, XML) | UTF-8 editor, line numbers, find, wrapping, explicit save and save-copy, optional highlight.js | 8 MB editing limit; highlighting limited to 500,000 characters. Text encodings other than UTF-8 may display incorrectly. HTML is not executed; optional preview runs in a restrictive sandbox with network/scripts disabled. |
| Markdown | Source editor plus Marked-rendered sandbox preview | Remote images and scripts disabled. Library needs internet. |
| CSV | Quoted-field parser, paged table and source editor | 4 MB, 100,000 rows; table shows 200 rows at a time and first 100 columns. No formula evaluation. |
| XLS/XLSX | SheetJS worker, worksheet selection and paged cell-value table | 32 MB input; first 10,000 rows/100 columns per sheet. No macros, charts, layout fidelity, formulas recalculation or workbook editing. Decoder needs internet. |
| DOCX, ODT | ZIP extraction + XML text preview | **Partial preview:** text, not original page layout, images or rich formatting. |
| PPTX | Slide text extraction with slide selector | **Partial preview:** text only, no slide layout, images, animation or presentation playback. |
| EPUB | Container/OPF/spine parsing and chapter text | **Partial preview:** chapter text, no illustrated layout or DRM. |
| RTF | Raw source/text editor | **Not a rich-text renderer.** Convert to PDF/DOCX for readable formatted viewing. |
| DOC, PPT | Information/error panel and original download | **Not decoded.** Convert legacy binary files to DOCX/PPTX/PDF externally. |
| ZIP | Worker directory browsing, stored/deflate extraction, CRC integrity validation; ZIP creation | No ZIP64, encrypted or split archives. Unsupported compression explicitly rejected. UTF-8 names expected. |
| TAR | Worker listing/extraction of regular files and folders | Links, GNU/PAX extended headers and other nonstandard records are rejected. |
| GZ/TGZ | Streaming gzip decompression in worker; optional TAR inspection | 128 MB expanded-data limit. No unlimited decompression. |
| RAR/7Z | Information/error panel and download | **Decoder not installed.** Extract externally with a compatible archive tool, then import results. |
| TTF/OTF/WOFF/WOFF2 | FontFace preview with editable sample and size control | 10 MB; browser font sanitizer can reject damaged fonts. Font removed when viewer closes. |
| GLB/GLTF, OBJ, STL | Three.js loaders, orbit/zoom and wireframe | 32 MB; WebGL required. OBJ geometry only (no MTL). GLTF resolves relative assets from the same local folder; external URLs disabled. Draco/KTX and extension-specific compression may need external conversion. |
| Application project files | JSON/text projects can use the text viewer; unknown formats show metadata | No universal proprietary-project decoder or editor. |
| SRT/VTT | Text editor and video subtitle import | SRT timing is converted to VTT for playback. |
| Unknown types | File properties, size, timestamps and original download | No fake rendering. |

## File-management behavior

- Up to 12 independent folder tabs, each keeping its own location, back/forward history, search, sort and view.
- Recent tracks opened files; Favorites toggles via the context menu.
- Grid icons, list and details; type filter; thumbnails for up to 100 small supported images per view.
- Ctrl/Cmd selection, Shift range, Ctrl+A/C/X/V, F2, Delete, Alt+Left/Right/Up. Keyboard shortcuts are scoped to Explorer and do not intercept editors.
- Drag files from the computer to import. Drag within Lolite to move; hold Ctrl to copy. Drop onto a folder to use that destination.
- Delete moves complete folder groups to Trash. Restore avoids overwriting collisions. Permanent deletion requires confirmation.
- Imports and paste generate unique names. Folder operations use path boundaries so deleting `A/` cannot affect `AB/`.
- Properties show created/modified times where available. Legacy files without a creation timestamp show “Not recorded”.

## Reliability and resource limits

Media uses Blob URLs and metadata-only preloading rather than reading entire videos into JavaScript. Workers handle archive parsing, MIDI, TIFF and spreadsheets. Lazy libraries are loaded only when selected; unavailable libraries show an error and leave the original downloadable.

Archive extraction is capped at 128 MB per batch and 10,000 entries. ZIP export is capped at 128 MB. ZIP central directories are read separately; unsafe paths, corrupt CRCs, unsupported encryption and invalid headers are rejected. File writes/deletes are committed in IndexedDB transactions. Viewers release worker, audio, WebGL and Blob URL resources on close. Explorer renders the first 1,000 matching rows; narrow larger listings with search.

Native codec behavior and lazy CDN decoders must still be checked in target browsers. Automated local verification covers archive decoding and unsafe-path rejection, MIDI note timing, CSV parsing, folder boundaries, Trash/restore collision handling, Recent and Favorites. It does not establish end-to-end browser compatibility for every encoding in the table.
