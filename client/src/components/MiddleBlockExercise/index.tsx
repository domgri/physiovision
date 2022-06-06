import { Row, Col } from "antd";
import { withTranslation } from "react-i18next";
import { Slide } from "react-awesome-reveal";
import { Button } from "../../common/Button";
import { MiddleBlockSection, Content, ContentWrapper } from "./styles";

import {useState} from "react";
import { lazy } from "react";
const ShoulderExercise = lazy(() => import ("../../exercises/ShoulderExercise"))


interface MiddleBlockExerciseProps {
  title: string;
  content: string;
  button: string;
  t: any;
  id: string;

}



const MiddleBlockExercise = ({ title, content, button, t, id }: MiddleBlockExerciseProps) => {
  
  const scrollTo = (id: string) => {
    const element = document.getElementById(id) as HTMLDivElement;
    element.scrollIntoView({
      behavior: "smooth",
    });
  };

  const [tryExercise, setTryExercise] = useState<Boolean>(false)

  return (
    <MiddleBlockSection>
      <Slide direction="up">
        <Row justify="center" align="middle"  id={id}>
          <ContentWrapper>
            <Col lg={24} md={24} sm={24} xs={24}>
            <ShoulderExercise />

              {/* {tryExercise ? 
              (<ShoulderExercise />) :
              (
                    <>

                  <h6>{t(title)}</h6>
                    <Content>{t(content)}</Content>
                    {button && (
                       <Button onClick={() => {setTryExercise(!tryExercise); scrollTo("mission")}}>
                        {t(button)}
                      </Button>
                    )} 
                    </>  
              )} */}
             
               
              
            </Col>
          </ContentWrapper>
        </Row>
      </Slide>
    </MiddleBlockSection>
  );
};

export default withTranslation()(MiddleBlockExercise);
