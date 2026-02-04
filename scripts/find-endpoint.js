const fs = require('fs');

function findEndpoint(name) {
  const data = JSON.parse(fs.readFileSync('postman/raw-collection.json', 'utf8'));

  function search(items) {
    for (const item of items) {
      if (item.name === name) {
        return item;
      }
      if (item.item) {
        const found = search(item.item);
        if (found) return found;
      }
    }
    return null;
  }

  return search(data.item);
}

const endpoint = findEndpoint('Create a new gym');
if (endpoint) {
  console.log('METHOD=' + endpoint.request.method);
  console.log('URL=' + endpoint.request.url.raw);
  if (endpoint.request.body && endpoint.request.body.raw) {
    console.log('BODY_SCHEMA=' + endpoint.request.body.raw);
  }
} else {
  console.log('NOT_FOUND');
}
