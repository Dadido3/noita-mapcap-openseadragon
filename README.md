# Noita MapCap OpenSeadragon

This is a web-based world viewer of the video game [Noita](https://noitagame.com/), based on OpenSeadragon.

You can self host this somewhere, and use it to view/show map captures that you have made with [Dadido3/noita-mapcap](https://github.com/Dadido3/noita-mapcap).

## Usage

1. Capture any part of the Noita world with [Noita MapCap](https://github.com/Dadido3/noita-mapcap) by following its instructions.
   When you come to the part where you use the [Noita MapCap stitch tool](https://github.com/Dadido3/noita-mapcap/tree/master/bin/stitch), use `output.dzi` instead of `output.png` as output file.

   :heavy_exclamation_mark: You need at least Noita MapCap 2.7.0 to be able to export DZI files.

2. Copy the generated `output.dzi` and the `output_files` directory into [captures/](captures/). Resulting in the following paths `captures/output.dzi` and `captures/output_files/0/...`.

3. Add a new entry to `noitaCaptures` in [js/captures.js](js/captures.js) pointing towards your newly added `captures/output.dzi`.
   You should follow the same format that the other entries are using.
   And you can get rid of all the example entries once you have added your own capture.

4. Upload all the files to some web server.
   No PHP or any other fancy stuff is required.
