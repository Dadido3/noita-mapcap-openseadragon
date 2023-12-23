# Noita MapCap OpenSeadragon

An example OpenSeadragon project for map captures that were made with [Dadido3/noita-mapcap](https://github.com/Dadido3/noita-mapcap).

## Usage

1. Capture any part of the Noita world with [Noita MapCap](https://github.com/Dadido3/noita-mapcap) by following its instructions.
   When you come to the part where you use the [Noita MapCap stitch tool](https://github.com/Dadido3/noita-mapcap/tree/master/bin/stitch), use `output.dzi` instead of `output.png` as output file.

   :heavy_exclamation_mark: You need at least Noita MapCap 2.7.0 to be able to export DZI files.

2. Copy the generated `output.dzi` and the `output_files` directory into [maps/](maps/). Resulting in the following paths `maps/output.dzi` and `maps/output_files/0/...`.

3. Ensure that the URL of `tileSources` in [js/script.js](js/script.js) points towards your newly added `maps/output.dzi`.

4. Upload all the files to some web server. No PHP or any other fancy stuff is required.
