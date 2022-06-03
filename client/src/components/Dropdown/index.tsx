import { withTranslation } from "react-i18next";
//import { StyledInput, Container, Menu, DropdownAntd, Button, DownOutlined, UserOutlined, Space } from "./styles";
import { StyledInput, Container, Select, Option, StyledSelect, StyledOption}  from "./styles";
import { Label } from "../../common/TextArea/styles";
import { InputProps } from "../../common/types";
import { DropdownProps } from "../../common/types";
import { StyledTextArea } from "../../common/TextArea/styles";

import {useState} from "react";


// export interface validateProps {
//   name: string;
//   message: string;
//   email: string;
//   emotion?: string;
// }


// interface menuItems {
//   label: string;
//   key: string;
// }


// const onClick = ({ key } : {key:any}) => {
  
//   console.log(`Click on item ${key}`);

 
  
// };
// const menu = (
//   <Menu
//      onClick={onClick}
//     items={[
//       {
//         label: 'Excited',
//         key: 'excited',
//         // icon: <UserOutlined />,
//       },
//       {
//         label: 'Interested',
//         key: 'interested',
//       },
//       {
//         label: 'Confused',
//         key: 'confised',
//       },
//       {
//         label: 'Upset',
//         key: 'upset',
//       },
//       {
//         label: 'Panicked',
//         key: 'panicked',
//       },
//       {
//         label: 'Angry',
//         key: 'angry',
//       },
//     ]}
//   />
// );

//const emotions: { [key: string]: string} = {default:"Confidencial", excited:"excited", interested:"interested"}
const emotions: string[] = ["Excited", "Interested"];
// const handleChange = (value : string) => {
//   console.log(`selected ${value}`);
// };

// const handleChange = (value : string, event: React.ChangeEvent<HTMLSelectElement>, onChange : (event: React.ChangeEvent<HTMLSelectElement>) => void) => {

//   console.log(event.target.name)
//   event.target.value = "angry"
//   console.log(event.target.value)
//   console.log("--")
//   onChange(event)
// }

const Dropdown = ({ name, defaultValue, t, value, onChange }: DropdownProps) => (

    <Container>
      <Label htmlFor={defaultValue}>{t(defaultValue)}</Label>
      <StyledSelect
       name={name}
       defaultValue={defaultValue}
      // onChange={event => handleChange(value, event, onChange)}
      onChange = {onChange}
    >
       <StyledOption value="interested">Interested</StyledOption>
       <StyledOption value="excited">Excited</StyledOption>
       <StyledOption value="confused">Confused</StyledOption>
       <StyledOption value="upset">Upset</StyledOption>
       <StyledOption value="panicked">Panicked</StyledOption>
       <StyledOption value="angry">Angry</StyledOption>

    </StyledSelect>


      </Container>
);


export default withTranslation()(Dropdown);



//   import { withTranslation } from "react-i18next";
// import { Container, StyledInput } from "./styles";
// import { Label } from "../TextArea/styles";
// import { InputProps } from "../types";

// const Input = ({ name, placeholder, onChange, t }: InputProps) => (
//   <Container>
//     <Label htmlFor={name}>{t(name)}</Label>
//     <StyledInput
//       placeholder={t(placeholder)}
//       name={name}
//       id={name}
//       onChange={onChange}
//     />
//   </Container>
// );

// export default withTranslation()(Input);
