const a = document.createElement('a');
let url = null;

export function saveJSONtoFile(obj, filename) {
  const blob = new Blob([ JSON.stringify(obj) ], { type: 'application/json' });
  if(url) {
    URL.revokeObjectURL(url);
  }
  url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
}