import { rejects } from "assert";

const fileSelect = document.createElement('input');
fileSelect.type = 'file';
fileSelect.accept = 'application/json';
fileSelect.multiple = false;

async function importFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', e => {
      resolve(JSON.parse(e.target.result));
    });
    if(file instanceof File) {
      fileReader.readAsText(file);
    } else {
      reject(new Error('No valid file selected.'));
    }
  });
}

export async function importJSONfromFile() {
  return new Promise((resolve, reject) => {
    fileSelect.value = null;
    fileSelect.click();
    fileSelect.oninput = async () => {
      try {
        const result = await importFile(fileSelect.files[0]);
        resolve(result);
      } catch(e) { reject(e); }
    };
  });
}


