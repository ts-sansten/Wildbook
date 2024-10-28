import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react-lite";
import GoogleMapReact from "google-map-react";
import useGetSiteSettings from "../models/useGetSiteSettings";
import { TreeSelect } from "antd";


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

export const PlaceSection = observer(({ store }) => {
  const { data } = useGetSiteSettings();
  const mapCenterLat = data?.mapCenterLat;
  const mapCenterLon = data?.mapCenterLon;
  const mapZoom = data?.mapZoom;
  const locationData1 = data?.locationData.locationID;  

  const locationData =
    [
      {
        "locationID": [
          {
            "locationID": [
              {
                "locationID": [],
                "name": "Mpala.North",
                "geospatiaInfo": {
                  "lat": 51.5074,
                  "lon": 7.1278
                },
                "id": "Mpala.North"
              },
              {
                "locationID": [],
                "name": "Mpala.Central",
                "id": "Mpala.Central"
              },
              {
                "locationID": [],
                "name": "Mpala.South",
                "id": "Mpala.South"
              }
            ],
            "name": "Mpala",
            "id": "Mpala"
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
            "id": "Ol Pejeta"
          },
          {
            "locationID": [],
            "name": "Ol Jogi",
            "id": "Ol Jogi"
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
        "id": "South Africa"
      }
    ];

    const [ bounds, setBounds ] = useState({
      north: 80,
      south: -80,
      east: 10,
      west: -10
    });
  
  function convertToTreeData(locationData) {
    
    return locationData.map((location) => ({
      title: location.name,
      value: location.id,
      children: location.locationID?.length > 0
        ? convertToTreeData(location.locationID)
        : []
    }));
  }

  const [treeData, setTreeData] = useState([]);
  const [treeData1, setTreeData1] = useState([]);

  useEffect(() => {
    if (locationData) {
      const data = convertToTreeData(locationData);
      console.log("data +++++++++",data);
      setTreeData(data);
      setTreeData1(data.filter(location => location.geospatiaInfo).filter((location) => {
        console.log("location +++++++++",location);
          return location.geospatiaInfo?.lat > bounds.south 
          && location.geospatiaInfo?.lat < bounds.north 
          && location.geospatiaInfo?.lon > bounds.west 
          && location.geospatiaInfo?.lon < bounds.east;      
        }))
  console.log(treeData);
  console.log("tree data +++++++++",treeData1);
    }
  }, [locationData]);

  // const filterData = treeData.filter((location) => {

  //   return location.geospatiaInfo.lat > bounds.south 
  //   && location.geospatiaInfo.lat < bounds.north 
  //   && location.geospatiaInfo.lon > bounds.west 
  //   && location.geospatiaInfo.lon < bounds.east;

  // });


  const handleMapClick = ({ lat, lng }) => {
    console.log("Map clicked", lat, lng);
    store.setLat(lat);
    store.setLon(lng);
  };

  return (
    <div>
      

      <Form.Group>
        <Form.Label>
          <FormattedMessage id="FILTER_LOCATION_ID" />
          {store.speciesSection.required && <span>*</span>}
        </Form.Label>
        <div className="position-relative d-inline-block w-100 mb-3">
          <TreeSelect
            treeData={treeData}
            value={store.locationId}
            onChange={(selectedValues) => {
              const singleSelection = selectedValues.length > 0 ? selectedValues[selectedValues.length - 1] : null;
              store.setLocationId(singleSelection);
            }}
            treeDefaultExpandAll
            showSearch
            style={{ width: "100%" }}
            placeholder={<FormattedMessage id="SELECT_LOCATION" />}
            allowClear
            treeCheckable={true}
            size="large"
            treeLine
            dropdownRender={(menu) => (
              <div style={{ 
                maxHeight: "400px", 
                overflowY: "auto",
                backgroundColor: "green",
                }}>
                {menu}
              </div>
            )}
            dropdownStyle={{ 
              backgroundColor: "white",
              padding: 0,
              paddingBottom: "20px",
              maxHeight: 400, 
              overflow: "auto" }}
          />

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
              value={store.lat || ""}
              onChange={(e) => store.setLat(parseFloat(e.target.value || 0))}
            />
          </div>
          <div className="w-50">
            <Form.Control
              type="text"
              required
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
