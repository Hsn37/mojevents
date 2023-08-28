const Handlebars = require("handlebars");
const fs = require("fs");
const path = require('path');

// log wrapper
var print = console.log

let data = {}

let root = './assets/images/events/'
let order = './assets/images/events/EventsOrder.txt'

fs.readdirSync(root).forEach((x, index) => {
    let __path = path.join(root, x)

    if (!fs.lstatSync(__path).isDirectory())
        return

    let event_data = {id: 'event' + index, title: x, media: [], thumbnail: ''}
    fs.readdirSync(__path).forEach((y) => {

        if (y.startsWith('thumbnail')) {
            event_data.thumbnail = path.join('/', __path, y).replaceAll('\\', '/')
        }
        else {
            let obj = {}
            obj['src'] = path.join('/', __path, y).replaceAll('\\', '/')
            obj['isImage'] = y.endsWith('.mov') || y.endsWith('.mp4')? false : true
            
            event_data.media.push(obj)
        }
    });

    data[event_data.title] = event_data
});

events_template = fs.readFileSync('templates/event.handlebars').toString()
gallery_template = fs.readFileSync('templates/gallery.handlebars').toString()

// remove existing rendered files
try {
    fs.readdirSync('./events').forEach(x => {
        fs.rmSync('./events/' + x)
    })
    
    fs.rmSync('./gallery.html')
}
catch (e) {
    print('Ignoring Exception', e.toString())
}


// sort the events
eventorder = fs.readFileSync(order).toString().split('\n').map(x => x.trim())
let finaldata = eventorder.reduce((prev, ev) => [...prev, data[ev]], [])

// event pages
for (let [index, event] of finaldata.entries()) {    
    let ev_rendered = Handlebars.compile(events_template)({
        title: event.title,
        media: event.media
    });

    fs.writeFileSync(`events/${event.id}.html`, ev_rendered)
}

// gallery page
fs.writeFileSync('gallery.html', Handlebars.compile(gallery_template)({events: finaldata}))
