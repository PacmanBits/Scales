var server=require('node-http-server');

server.deploy(
    {
        port:8010,
        root:'./site'
    }
);