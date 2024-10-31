import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react-lite";
import GoogleMapReact from "google-map-react";
import useGetSiteSettings from "../../models/useGetSiteSettings";
import { TreeSelect, Tag } from "antd";
import MainButton from "../../components/MainButton";
import ThemeColorContext from "../../ThemeColorProvider";
import { LocationFilterByMap } from "./LocationFilterByMap";
import "./reportEncounter.css"
import { Alert } from "react-bootstrap";

const MyPin = React.memo(() => {
  return <i
    className="bi bi-geo-alt-fill"
    style={{
      fontSize: "20px",
      color: "red",
      position: "absolute",
      top: "-30px",
      left: "-10px",
    }}
  ></i>

});

const customTagRender = (props) => {
  const { label } = props;
  return (
    <Tag
      style={{
        borderRadius: '8px',
        backgroundColor: 'white',
        border: "none",
        color: 'black',
        fontSize: '1rem',
      }}
    >
      {label}
    </Tag>
  );
};

function convertToTreeData(locationData) {

  return locationData.map((location) => ({
    title: location.name,
    value: location.id,
    geospatiaInfo: location.geospatiaInfo,
    children: location.locationID?.length > 0
      ? convertToTreeData(location.locationID)
      : []
  }));
}

export const PlaceSection = observer(({ store }) => {
  const { data } = useGetSiteSettings();
  const mapCenterLat = data?.mapCenterLat;
  const mapCenterLon = data?.mapCenterLon;
  const mapZoom = data?.mapZoom;
  const [modalShow, setModalShow] = useState(false);
  const theme = React.useContext(ThemeColorContext);

  console.log("++++++++++++++++++", JSON.stringify(store.placeSection));

  const locationData =
    [
      {
        "locationID": [
          {
            "locationID": [
              {
                "locationID": [],
                "name": "Mpala.North",
                "id": "Mpala.North"
              },
              {
                "locationID": [],
                "name": "Mpala.Central",
                "id": "Mpala.Central",

              },
              {
                "locationID": [],
                "name": "Mpala.South",
                "id": "Mpala.South"
              }
            ],
            "name": "Mpala",
            "id": "Mpala",
            "geospatiaInfo": {
              "lat": 0,
              "lon": 40
            },
          },
          {
            "locationID": [
              {
                "locationID": [],
                "name": "Ol Pejeta.East",
                "id": "Ol Pejeta.East"
              },
              {
                "locationID": [],
                "name": "Ol Pejeta.West",
                "id": "Ol Pejeta.West"
              }
            ],
            "name": "Ol Pejeta",
            "geospatiaInfo": {
              "lat": 51.5074,
              "lon": 7.1278
            },
            "id": "Ol Pejeta"
          },
          {
            "locationID": [],
            "name": "Ol Jogi",
            "id": "Ol Jogi",
            "geospatiaInfo": {
              "lat": 51.5074,
              "lon": 7.1278
            },
          }
        ],
        "name": "Kenya",
        "id": "Kenya"
      },
      {
        "locationID": [
          {
            "locationID": [],
            "name": "Elandsberg Nature Reserve",
            "id": "Elandsberg Nature Reserve"
          },
          {
            "locationID": [],
            "name": "Kosierskraal",
            "id": "Kosierskraal"
          },
          {
            "locationID": [],
            "name": "KwaZulu-Natal",
            "id": "KwaZulu-Natal"
          },
          {
            "locationID": [],
            "name": "Nelson Mandela University Nature Reserve",
            "id": "Nelson Mandela University Nature Reserve"
          },
          {
            "locationID": [],
            "name": "Nuwejaars Wetland SMA",
            "id": "Nuwejaars Wetland SMA"
          },
          {
            "locationID": [],
            "name": "Pilanesberg National Park",
            "id": "Pilanesberg National Park"
          },
          {
            "locationID": [],
            "name": "Pampoenvlei",
            "id": "Pampoenvlei"
          },
          {
            "locationID": [],
            "name": "Groote Post",
            "id": "Groote Post"
          },
          {
            "locationID": [],
            "name": "Vlakkenhuiwel",
            "id": "Vlakkenhuiwel"
          }
        ],
        "name": "South Africa",
        "id": "South Africa",
        "geospatiaInfo": {
          "lat": 51.5074,
          "lon": 7.1278
        },
      }
    ];

  const [treeData, setTreeData] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (locationData) {
      const data = convertToTreeData(locationData);
      setTreeData(data);
    }
  }, [JSON.stringify(locationData)]);

  const handleMapClick = ({ lat, lng }) => {
    console.log("Map clicked", lat, lng);
    store.setLat(lat);
    store.setLon(lng);
  };

  return (
    <div>
      <LocationFilterByMap
        store={store}
        modalShow={modalShow}
        setModalShow={setModalShow}
        treeData={treeData}
        mapCenterLat={mapCenterLat}
        mapCenterLon={mapCenterLon}
        mapZoom={mapZoom}
      />
      <Form.Group>
        <h5>
          <FormattedMessage id="PLACE_SECTION" />
          {store.placeSection.required && <span>*</span>}
        </h5>
        <p className="fs-6">
          <FormattedMessage id="LOCATION_ID_REQUIRED_WARNING" />
        </p>
        <Form.Label>
          <FormattedMessage id="LOCATION_ID" />
          {store.placeSection.required && <span>*</span>}
        </Form.Label>
        <div className="position-relative d-inline-block w-100 mb-3">
          <TreeSelect
            treeData={treeData}
            open={dropdownOpen}
            tagRender={customTagRender}
            onDropdownVisibleChange={(open) => setDropdownOpen(open)}
            value={store.placeSection.locationId}
            treeCheckStrictly
            onChange={
              (selectedValues) => {
                console.log("selectedValues", selectedValues);
                const singleSelection = selectedValues.length > 0 ? selectedValues[selectedValues.length - 1] : null;
                store.setLocationId(singleSelection?.value || null);
              }
            }
            treeDefaultExpandAll
            showSearch
            style={{ width: "100%" }}
            placeholder={<FormattedMessage id="LOCATIONID_INSTRUCTION" />}
            allowClear
            treeCheckable={true}
            size="large"
            treeLine
            dropdownRender={(menu) => (
              <div style={{
                maxHeight: "400px",
              }}>
                <div style={{
                  overflowY: "auto",
                  padding: "10px",
                  flexGrow: 1
                }}>
                  {menu}
                </div>

                <div className="d-flex justify-content-between align-items-center"
                  style={{
                    position: "sticky",
                    bottom: 0,
                    paddingLeft: "10px",
                    width: "100%",
                    height: "50px",
                  }}
                >
                  <a
                    style={{
                      color: "blue",
                    }}
                    onClick={() => {
                      setModalShow(true);
                    }}><FormattedMessage id="FILTER_BY_MAP" /></a>
                  <div className="d-flex flex-row">
                    <MainButton
                      noArrow={true}
                      backgroundColor={theme.primaryColors.primary500}
                      color="white"
                      className="btn btn-primary"
                      onClick={() => {
                        setDropdownOpen(false);
                      }}
                    > <FormattedMessage id="DONE" /></MainButton>
                    <MainButton
                      noArrow={true}
                      backgroundColor={"white"}
                      color={theme.primaryColors.primary500}
                      className="btn btn-primary"
                      onClick={() => {
                        setDropdownOpen(false);
                        store.setLocationId(null);
                      }}
                    > <FormattedMessage id="CANCEL" /></MainButton>
                  </div>

                </div>
              </div>
            )}
            dropdownStyle={{
              maxHeight: "500px",
              backgroundColor: "white",
              padding: 0,
              paddingBottom: "20px",
              overflow: "auto"
            }}
          />

          {store.placeSection.error && (
            <Alert
              variant="danger"
              style={{
                marginTop: "10px",
              }}
            >
              <i
                className="bi bi-info-circle-fill"
                style={{ 
                  marginRight: "8px", 
                  color: theme.statusColors.red600
                }}
              ></i>
              <FormattedMessage id="EMPTY_REQUIRED_WARNING" />
            </Alert>
          )}

        </div>
        <Form.Label>
          <FormattedMessage id="FILTER_GPS_COORDINATES" />
          {store.speciesSection.required && <span>*</span>}
        </Form.Label>
        <div className="d-flex flex-row gap-3">
          <div className="w-50">
            <Form.Control
              type="text"
              required
              placeholder="##.##"
              value={store.lat || ""}
              onChange={(e) => store.setLat(parseFloat(e.target.value || 0))}
            />
          </div>
          <div className="w-50">
            <Form.Control
              type="text"
              required
              placeholder="##.##"
              value={store.lon || ""}
              onChange={(e) => store.setLon(parseFloat(e.target.value || 0))}
            />
          </div>
        </div>
      </Form.Group>

      <div
        className="mt-4"
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        {
          mapCenterLat && mapCenterLon && mapZoom && (
            <GoogleMapReact
              bootstrapURLKeys={{ key: "AIzaSyBp0XgdcCh6jF9B2OJtsL1JtYvT5zdrllk" }}
              center={{
                lat: mapCenterLat,
                lng: mapCenterLon,
              }}
              defaultZoom={mapZoom || 4}
              onClick={handleMapClick}
              onChildClick={(key) => console.log(key, 'haha')}
              yesIWantToUseGoogleMapApiInternals
            >
              {store.lat && store.lon &&
                <MyPin lat={parseFloat(store.lat)} lng={parseFloat(store.lon)} />
              }

            </GoogleMapReact>)
        }

      </div>
    </div>
  );
});

export default PlaceSection;
