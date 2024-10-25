import React from "react";
import { Form, Alert } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react-lite";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

export const DateTimeSection = observer(({ store }) => {
  console.log("DateTimeSection");
  console.log(JSON.stringify(store.dateTimeSection));
  return (
    <div>
      <h5>
        <FormattedMessage id="DATETIME_SECTION" />
        {store.dateTimeSection.required && <span>*</span>}
      </h5>
      <p className="fs-6">
        <FormattedMessage id="DATE_INSTRUCTION" />
      </p>
      <Form.Group>
        {store.dateTimeSection.error && (
          <Alert
            variant="danger"
            style={{
              marginTop: "10px",
            }}
          >
            <i
              className="bi bi-info-circle-fill"
              style={{ marginRight: "8px", color: "#560f14" }}
            ></i>
            <FormattedMessage id="EMPTY_REQUIRED_WARNING" />
          </Alert>
        )}
        <Form.Label>
          <FormattedMessage id="DATETIME_SECTION" />
          {store.dateTimeSection.required && <span>*</span>}
        </Form.Label>
        <Datetime
          inputProps={{ placeholder: "YYYY-MM-DD" }}
          value={store.dateTimeSection.value}
          onChange={(e) => {
            store.setDateTimeSectionValue(e);
            store.setSpeciesSectionError(e ? false : true);
          }}
        />
        <div className="position-relative d-inline-block w-100 mt-4">
          <Form.Label>
            <FormattedMessage id="DATETIME_EXIF" />
          </Form.Label>
          <Form.Control
            as="select"
            onChange={(e) => {
              store.setDateTimeSectionValue(new Date(e.target.value));
            }}
          >
            <option value="">
              <FormattedMessage id="SELECT_DATETIME" />
            </option>
            {store.exifDateTime.map((option, optionIndex) => (
              <option key={optionIndex} value={option}>
                {option}
              </option>
            ))}
          </Form.Control>
        </div>
      </Form.Group>
    </div>
  );
});
