import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom";
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from "react-i18next";
import 'antd/dist/antd.min.css';

import Router from "./router";
import i18n from "./translation";


// TODO: fix web vitals, might be useful?
// import reportWebVitals from "./reportWebVitals";

// const App = () => (
//   <BrowserRouter>
//     <I18nextProvider i18n={i18n}>
//       <Router />
//     </I18nextProvider>
//   </BrowserRouter>
// );

// ReactDOM.render(<App />, document.getElementById("root"));
const element = document.getElementById('root');
const root = createRoot(element!);
//const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <BrowserRouter>
     <I18nextProvider i18n={i18n}>
       <Router />
     </I18nextProvider>
   </BrowserRouter>
);

// reportWebVitals();
