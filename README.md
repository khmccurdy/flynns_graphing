This should work with the Flynns. If it doesn't find them, it generates randomized data. Graph arrangements are far from final and will be adjusted to reflect the positioning of their respective sensors.

[Try it!](https://khmccurdy.github.io/flynns_graphing/sensor%20data%201.html)

Video recordings of this and similar demos will be posted [here](https://www.youtube.com/channel/UCbrhYUVkQWcBhaPzl_J6kYA).

**Recording, Playing Back, and Loading Data**

The following code can be run from the browser's console.
* To record a stream of data out of the Flynns for later use: `flynnsRecord('name')`. When done, `flynnsStopRecord()`.
* To play back a stream of data stored in memory: `flynnsReplay('name')`. When done, `flynnsStopReplay()`.
* To save a recording's data for later use:
  * `printRecording('name')` to dump JSON data to the console.
  * Select the full output (may require expanding the twirl-down for longer outputs), copy and paste into a text editor.
  * Save the file in `.json` format.
* To load a saved recording:
  * `loadRecording('filepath.json','name')` - beware of CORS permission errors.
    * If both the file and `sensor data 1.html` are hosted locally, you may need to run through `localhost`.
    * If the file is hosted on the web, the request may or may not succeed depending on how the host website is configured.
  * `flynnsReplay('name')` to play back the loaded test.
