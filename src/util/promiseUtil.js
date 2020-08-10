const handle = (promise) => (promise
  .then((data) => [undefined, data]).catch((e) => Promise.resolve([e, undefined])));

export default handle;
