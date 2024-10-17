import React, { useContext, useState, useRef, useEffect } from "react";
import { Container, Row, Col, Form, Alert } from "react-bootstrap";
import ThemeColorContext from "../../ThemeColorProvider";
import MainButton from "../../components/MainButton";
import AuthContext from "../../AuthProvider";
import { FormattedMessage } from "react-intl";
import ImageSection from "./ImageSection";
import DateTimeSection from "../../components/DateTimeSection";
import PlaceSection from "../../components/PlaceSection";
import { AdditionalCommentsSection } from "../../components/AdditionalCommentsSection";
import { FollowUpSection } from "../../components/FollowUpSection";
import { observer, useLocalObservable } from "mobx-react-lite";
import { ReportEncounterStore } from "./ReportEncounterStore";
import { ReportEncounterSpeciesSection } from "./SpeciesSection";
import { useNavigate } from "react-router-dom";
import useGetSiteSettings from "../../models/useGetSiteSettings";
import { Modal, Button } from "react-bootstrap";
import "./recaptcha.css";

export const ReportEncounter = observer(() => {
  const themeColor = useContext(ThemeColorContext);
  const { isLoggedIn } = useContext(AuthContext);
  const Navigate = useNavigate();
  const { data } = useGetSiteSettings();
  const [human, setHuman] = useState(false);
  const reCAPTCHAEnterpriseSiteKey = data?.reCAPTCHAEnterpriseSiteKey;

  const store = useLocalObservable(() => new ReportEncounterStore());

  store.setImageRequired(!isLoggedIn);

  const handleSubmit = async () => {
    if (!store.validateFields()) {
      console.log("Field validation failed.");
      return;
    } else if (!human) {
      // alert("Please verify that you are human.");
      // store.setConfirmationModalShow(true);
      // return;
    } else {
      console.log("Fields validated successfully. Submitting report.");
      await store.submitReport();
    }
  };

  // console.log(store.confirmationModalShow);

  useEffect(() => {
    console.log("Success: ", store.success, "Finished: ", store.finished);

    if (store.success && store.finished) {
      alert("Report submitted successfully.");
      Navigate("/home");
    } else if (!store.success && store.finished) {
      alert("Report submission failed");
    }
  }, [store.success, store.finished]);

  // Categories for sections
  const encounterCategories = [
    {
      title: "PHOTOS_SECTION",
      section: <ImageSection reportEncounterStore={store} />,
    },
    {
      title: "DATETIME_SECTION",
      section: <DateTimeSection reportEncounterStore={store} />,
    },
    {
      title: "PLACE_SECTION",
      section: <PlaceSection reportEncounterStore={store} />,
    },
    {
      title: "SPECIES",
      section: <ReportEncounterSpeciesSection reportEncounterStore={store} />,
    },
    {
      title: "ADDITIONAL_COMMENTS_SECTION",
      section: <AdditionalCommentsSection reportEncounterStore={store} />,
    },
    {
      title: "FOLLOWUP_SECTION",
      section: <FollowUpSection reportEncounterStore={store} />,
    },
  ];

  const menu = encounterCategories.map((category, index) => ({
    id: index,
    title: category.title,
  }));

  const [selectedCategory, setSelectedCategory] = useState(0);
  const formRefs = useRef([]);
  const isScrollingByClick = useRef(false);
  const scrollTimeout = useRef(null);

  const handleClick = (id) => {
    clearTimeout(scrollTimeout.current);
    setSelectedCategory(id);
    isScrollingByClick.current = true;

    if (formRefs.current[id]) {
      formRefs.current[id].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    scrollTimeout.current = setTimeout(() => {
      isScrollingByClick.current = false;
    }, 1000);
  };

  const handleScroll = () => {
    if (isScrollingByClick.current) return;

    formRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
          setSelectedCategory(index);
        }
      }
    });
  };

  // function renderRecaptchaV2() {
  //   console.log("falling back to v2");
  //   if (
  //     window.grecaptcha &&
  //     window.grecaptcha.render &&
  //     store.confirmationModalShow &&
  //     !isLoggedIn
  //   ) {
  //     console.log("rendering v2");
  //     window.grecaptcha.render("recaptcha-container", {
  //       sitekey: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",
  //       theme: "light",
  //     });
  //   } else {
  //     console.error("Failed to load reCAPTCHA v2");
  //   }
  // }

  // useEffect(() => {
  //   const loadRecaptchaV2 = () => {
  //     const script = document.createElement("script");
  //     script.src = "https://www.google.com/recaptcha/api.js"; // For reCAPTCHA v2
  //     script.async = true;
  //     script.defer = true;
  //     document.body.appendChild(script);

  //     script.onload = () => {
  //       console.log("reCAPTCHA v2 script loaded successfully");
  //       if (store.confirmationModalShow && !isLoggedIn) {
  //         renderRecaptchaV2();
  //       } // Initialize the reCAPTCHA once the script has loaded
  //     };

  //     script.onerror = () => {
  //       console.error("Failed to load reCAPTCHA v2 script");
  //     };
  //   };

  //   loadRecaptchaV2();
  // }, [
  //   store.confirmationModalShow,
  //   isLoggedIn,
  //   window.grecaptcha,
  //   window.grecaptcha.render,
  // ]);

  // function sendToServer() {
  //   console.log("sending to server");
  //   if (!window.grecaptcha || !window.grecaptcha.enterprise) {
  //     console.error("reCAPTCHA is not ready yet.");
  //     return;
  //   }
  //   window.grecaptcha.enterprise.ready(async () => {
  //     const token = await window.grecaptcha.enterprise.execute(
  //       reCAPTCHAEnterpriseSiteKey,
  //       { action: "VALIDATE" },
  //     );
  //     console.debug("captcha got token: " + token);
  //     console.log(">>>>>>>>>>>>> token=%o", token);
  //     let payload = { recaptchaToken: token, useEnterprise: true };
  //     console.log("payload %o", payload);
  //     console.debug("sending to server");
  //     let res = await fetch("/ReCAPTCHA", {
  //       method: "POST",
  //       headers: { "content-type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });
  //     let data = await res.json();
  //     // renderRecaptchaV2();
  //     setHuman(data.valid);
  //     console.log("res data %o", data);
  //     console.debug("server thinks we are human? => " + JSON.stringify(data));
  //   });
  // }

  // useEffect(() => {
  //   if (!isLoggedIn && window.grecaptcha && reCAPTCHAEnterpriseSiteKey) {
  //     sendToServer();
  //   }
  // }, [isLoggedIn, window.grecaptcha, reCAPTCHAEnterpriseSiteKey]);

  // const captchaContainer = document.getElementById('procaptcha-container')
  // console.log('captchaContainer: %o', captchaContainer);

  // useEffect(() => {

  //   console.log('window.render: %o', window.render);
  //   console.log('captchaContainer: %o', captchaContainer);
  //   if (captchaContainer && window.render) {
  //     console.log('rendering procaptcha');
  //     window.render(captchaContainer, {
  //       siteKey: '5FNwzzqEhmxNk4jeWLeteBCSd696DEX9YbttnsjJ6XkhbWCL',
  //       callback: onCaptchaVerified,
  //     });
  //   }

  // }, [captchaContainer, window.render]);

  // const onCaptchaVerified = async (output) => {
  //   console.log(' ' + JSON.stringify(output));

  //   const payload = { procaptchaValue: output };
  //   console.log('payload: %o', payload);

  //   try {
  //     const res = await fetch('/ReCAPTCHA', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload),
  //     });

  //     const data = await res.json();
  //     console.log('data: %o', data);
  //   } catch (error) {
  //     console.error('error:', error);
  //   }
  // };



  const captchaRef = useRef(null);
  useEffect(() => {
    let isCaptchaRendered = false;

    const loadProCaptcha = async () => {
      if (isCaptchaRendered || !captchaRef.current) return;

      const { render } = await import('https://js.prosopo.io/js/procaptcha.bundle.js');

      render(captchaRef.current, {
        siteKey: '5FNwzzqEhmxNk4jeWLeteBCSd696DEX9YbttnsjJ6XkhbWCL',
        callback: onCaptchaVerified,
      });

      isCaptchaRendered = true;
    };

    loadProCaptcha();

    return () => {
      if (captchaRef.current) {
        captchaRef.current.innerHTML = '';
      }
      isCaptchaRendered = false;
    };
  }, []);

  const onCaptchaVerified = async (output) => {
    console.log('Captcha verified, output: ' + JSON.stringify(output));
    const payload = { procaptchaValue: output };

    try {
      const res = await fetch('/ReCAPTCHA', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log('Response data: ', data);
    } catch (error) {
      console.error('Error submitting captcha: ', error);
    }
  };

  return (
    <Container>
      {/* <Modal show={store.confirmationModalShow} centered>
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title>
            <FormattedMessage id="SUBMIT_ANON_CONFIRM_TITLE" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ borderTop: "none", padding: "10px" }}>
          <FormattedMessage id="SUBMIT_ANON_CONFIRM_DESCRIPTION" />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div id="recaptcha-container"></div>
            <div id="procaptcha-container"></div>
            <textarea ref={debugRef} style={{ width: '100em', height: '45em' }}></textarea>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none" }}>
          <Button
            variant="secondary"
            onClick={() => store.setConfirmationModalShow(false)}
          >
            Login
          </Button>
          <Button
            variant="primary"
            onClick={() => store.setConfirmationModalShow(false)}
          >
            Submit anyways
          </Button>
        </Modal.Footer>
      </Modal> */}
      <Row>
        <h3 className="pt-4">
          <FormattedMessage id="REPORT_AN_ENCOUNTER" />
        </h3>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {/* <div id="recaptcha-container"></div> */}
          <div id="procaptcha-container" ref={captchaRef}></div>
          {/* <textarea ref={debugRef} style={{ width: '100em', height: '45em' }}></textarea> */}
        </div>
        <p>
          <FormattedMessage id="REPORT_PAGE_DESCRIPTION" />
        </p>
        {!isLoggedIn ? (
          <Alert variant="warning" dismissible>
            <i
              className="bi bi-info-circle-fill"
              style={{ marginRight: "8px", color: "#7b6a00" }}
            ></i>
            <FormattedMessage id="SIGNIN_REMINDER_BANNER" />{" "}
            <a
              href="/react/login?redirect=%2Freport"
              style={{ color: "#337ab7", textDecoration: "underline" }}
            >
              <FormattedMessage id="LOGIN_SIGN_IN" />
              {"!"}
            </a>
          </Alert>
        ) : null}
      </Row>
      <Row>
        <Alert
          variant="light"
          className="d-inline-block p-2"
          style={{
            color: "#dc3545",
            width: "auto",
            border: "none",
          }}
        >
          <strong>
            <FormattedMessage id="REQUIRED_FIELDS_KEY" />
          </strong>
        </Alert>
      </Row>

      <Row>
        <Col className="col-lg-4 col-md-6 col-sm-12 col-12 ps-0">
          <div
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),url(${process.env.PUBLIC_URL}/images/report_an_encounter.png)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "25px",
              padding: "20px",
              height: "470px",
              maxWidth: "350px",
              color: "white",
              marginBottom: "20px",
            }}
          >
            {menu.map((data) => (
              <div
                key={data.id}
                className="d-flex justify-content-between"
                style={{
                  padding: "10px",
                  marginTop: "10px",
                  fontSize: "20px",
                  fontWeight: "500",
                  cursor: "pointer",
                  borderRadius: "10px",
                  backgroundColor:
                    selectedCategory === data.id
                      ? "rgba(255,255,255,0.5)"
                      : "transparent",
                }}
                onClick={() => handleClick(data.id)}
              >
                <FormattedMessage id={data.title} />
                <i
                  className="bi bi-chevron-right"
                  style={{ fontSize: "14px", fontWeight: "500" }}
                ></i>
              </div>
            ))}

            <MainButton
              backgroundColor={themeColor.wildMeColors.cyan600}
              color={themeColor.defaultColors.white}
              shadowColor={themeColor.defaultColors.white}
              style={{
                width: "calc(100% - 20px)",
                fontSize: "20px",
                marginTop: "20px",
                marginBottom: "20px",
              }}
              onClick={handleSubmit} // Trigger file upload
            // disabled={!formValid}
            >
              <FormattedMessage id="SUBMIT_ENCOUNTER" />
            </MainButton>
          </div>
        </Col>

        <Col
          className="col-lg-8 col-md-6 col-sm-12 col-12 h-100 pe-4"
          style={{
            maxHeight: "470px",
            overflow: "auto",
          }}
          onScroll={handleScroll}
        >
          <Form>
            {encounterCategories.map((category, index) => (
              <div
                key={index}
                ref={(el) => (formRefs.current[index] = el)}
                style={{ paddingBottom: "20px" }}
              >
                {category.section}
              </div>
            ))}
          </Form>
        </Col>
      </Row>
    </Container>
  );
});

export default ReportEncounter;
