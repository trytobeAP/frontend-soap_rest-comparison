/// <reference types="vite/client" />

/* 
  Эта строка выше подключает типы Vite.
  Теперь TS понимает импорты .css, .png и т.д.
*/

/* 
  А это костыль специально для Vuetify, 
  так как у него стили не имеют встроенных типов.
*/
declare module 'vuetify/styles' {
  const styles: any;
  export default styles;
}
