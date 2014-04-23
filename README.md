briefServer - LettrServ
==========


Installation
----------

Make sure you're using `ruby 1.9.3`,
    rvm use ruby-1.9.3-p327
    
then install dependencies
    npm install formidable
    npm install gammalatex

and finally start the server
    node app.js
    
Best used with
------------
To access this server properly, you can use the [LettrIt](https://github.com/frosch03/pdfBrief.git) Application.

Problems
--------

At the moment, i wrote my local ip-address hardcoded into the source. To get it working, search for `192.168.0.17` and replace it with you own ip.
