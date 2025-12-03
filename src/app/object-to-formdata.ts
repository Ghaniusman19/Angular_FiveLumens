export function appendFormData(formData: FormData, data: any, parentKey: string = '') {
  if (data === null || data === undefined) return;

  if (Array.isArray(data)) {
    data.forEach((value, index) => {
      const key = parentKey ? `${parentKey}[${index}]` : `${index}`;
      appendFormData(formData, value, key);
    });
  } else if (typeof data === 'object' && !(data instanceof File)) {
    Object.keys(data).forEach((keyName) => {
      const value = data[keyName];
      const newKey = parentKey ? `${parentKey}[${keyName}]` : keyName;
      appendFormData(formData, value, newKey);
    });
  } else {
    formData.append(parentKey, data);
  }
}
