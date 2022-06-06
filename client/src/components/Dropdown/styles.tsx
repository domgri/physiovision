import styled from "styled-components";

import { StyledButton } from "../../common/Button/styles";
import { Span } from "../Header/styles";

// import { Menu as MenuAntd, Dropdown, Button as ButtonAntd, message, Space as SpaceAntd, Tooltip } from 'antd';
// import { DownOutlined as DownOutlinedAntd, UserOutlined as UserOutlinedAntd } from '@ant-design/icons';

import {Select as SelectAntd}  from 'antd';

export const { Option } = SelectAntd;
export const Select = SelectAntd;

// export const StyledSelect = styled("select")`
//   width: 120;
// `;

export const StyledSelect = styled("select")`
  background: #f1f2f3;
  width: 100%;
  border: 1px solid #edf3f5;
  border-radius: 4px;
  padding: 13px 0;
  cursor: pointer;
  max-width: 180px;
  transition: all 0.3s ease-in-out;
  padding-left: 1.25rem;
`;

export const StyledOption = styled("option")`
`;

// export const Option = OptionAntd


// export const Menu = MenuAntd;

// export const Button = StyledButton;


// export const Button: React.FunctionComponent<any> = styled(ButtonAntd)`

// `
// export const Button = ButtonAntd;

// export const DownOutlined = DownOutlinedAntd
// export const UserOutlined = UserOutlinedAntd
// export const Space = SpaceAntd



// export const DropdownAntd = Dropdown;


export const Container = styled("div")`
  display: inline-block;
  width: 100%;
  padding: 10px 5px;
`;

export const StyledInput = styled("input")`
  font-size: 0.875rem;
`;
