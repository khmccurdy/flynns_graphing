This should work with the Flynns. If it doesn't find them, it generates randomized data. Graph arrangements generally reflect the positioning of their respective sensors - new profiles will be added as the prototypes evolve.

[Try it!](https://khmccurdy.github.io/flynns_graphing/sensor%20data%201.html)

Demo of sensors in action: [Video 1](https://www.linkedin.com/feed/update/urn:li:activity:6494716930900004864/), [Video 2](https://www.instagram.com/p/BtFvshJhY2J/)

<!-- Video recordings of this and similar demos will be posted [here](https://www.youtube.com/channel/UCbrhYUVkQWcBhaPzl_J6kYA). -->

**Recording, Playing Back, and Loading Data**

The following code can be run from the browser's console. This allows recording of data from the Flynns so that users without access to them can still load and observe real input.
* To record a stream of data out of the Flynns for later use: `flynnsRecord('name')`. When done, `flynnsStopRecord()`.
* To play back a stream of data stored in memory: `flynnsReplay('name')`. When done, `flynnsStopReplay()`. 
  * Input from the Flynns will be ignored until playback is stopped.
* To save a recording's data for later use:
  * `printRecording('name')` to dump JSON data to the console OR `textRecording('name')` to render JSON as text below the graphs.
  * Select the full output.
    * If printed to console, may require expanding the twirl-down for longer outputs.
    * If rendered to screen, simply select all text using Ctrl/Cmd+A (make sure you switch focus to the webpage itself, or you'll simply select the text from the Console's input).
  * Copy and paste into a text editor.
  * Save the file in `.json` format.
* To load a saved recording:
  * `loadRecording('filepath.json','name')` - beware of CORS permission errors.
    * If both the file and `sensor data 1.html` are hosted locally, you may need to run through `localhost`.
    * If the file is hosted on the web, the request may or may not succeed depending on how the host website is configured.
  * `flynnsReplay('name')` to play back the loaded test.
