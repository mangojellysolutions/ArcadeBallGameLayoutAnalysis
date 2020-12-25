# ArcadeBallGameLayoutAnalysis

Very simple layout analysis to allow output of normalised X,Y co-ord in JSON format for the arcade ball games 'Ice Cold Beer' along with layout and images of original game.

Prerequisite
To load the index htm it needs to be accessed from a webserver due to access to the layout image so you will need to run from a simple http server such as using the a one liner from a terminal such as:

$ python -m SimpleHTTPServer 8000

Obviously this will need python installed.

$ sudo apt install python

Other http servers that can be run from a terminal with a single line can be found at https://gist.github.com/willurd/5720255

Running
1. Clone the repo
2. Open a ternimal and cd to the ArcadeBallGameLayoutAnalysis
3. Run the http server onliner i.e.
$ python -m SimpleHTTPServer 8000
4. Open up a browser window and navigate to http://localhost:8000/index.html
(Replace the port with the port you have supplied).

Usage
The index page will load the main application.  On the left you will see the layout of the board which has been loaded from the Layouts directory and on the right a text area along with a button.  Clicking the button will process the image to figure out the position of the predefined coloured holes so this will need to be defined in the code first in the config.
