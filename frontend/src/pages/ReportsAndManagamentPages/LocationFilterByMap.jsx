import React, { useEffect, useState, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import GoogleMapReact from 'google-map-react';
import MainButton from '../../components/MainButton';
import ThemeColorContext from '../../ThemeColorProvider';
import { observer } from "mobx-react-lite";
import "./reportEncounter.css";
import { TreeSelect } from 'antd';
import Map from '../../components/Map';
import { debounce } from 'lodash';


const filterLocationsInBounds = (treeData, bounds) => {
  console.log("bounds", bounds);

  const { north, south, east, west } = bounds;

  const isWithinBounds = (geospatiaInfo) => {
    if (!geospatiaInfo) return false;
    const { lat, lon } = geospatiaInfo;
    return lat <= north && lat >= south && lon <= east && lon >= west;
  };

  const filterTree = (nodes) => {
    return nodes
      .map((node) => {
        const filteredChildren = filterTree(node.children || []);
        const nodeInBounds = isWithinBounds(node.geospatiaInfo) || filteredChildren.length > 0;

        if (nodeInBounds) {
          return {
            ...node,
            children: filteredChildren
          };
        }
        return null;
      })
      .filter((node) => node !== null);
  };

  return filterTree(treeData);
};


export const LocationFilterByMap = observer(({
  store,
  modalShow,
  setModalShow,
  treeData,
  mapCenterLat,
  mapCenterLon,
  mapZoom,
}
) => {

  const theme = React.useContext(ThemeColorContext);
  const [mapTreeData, setMapTreeData] = useState([]);
  const [isMouseUp, setIsMouseUp] = useState(false);

  const [bounds, setBounds] = useState({
    north: 55,
    south: 45,
    east: 10,
    west: 1
  });

  useEffect(() => {
    const handleMouseUp = () => {
      setIsMouseUp(true);
    };
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (isMouseUp && bounds) {
      console.log("filterLocationsInBounds(treeData, bounds)", filterLocationsInBounds(treeData, bounds));
      setMapTreeData(filterLocationsInBounds(treeData, bounds));
    }
  }, [JSON.stringify(treeData), bounds, isMouseUp]);
  
  return <Modal
    dialogClassName="modal-90w"
    show={modalShow}
    size="lg"
    onHide={() => setModalShow(false)}
    keyboard
    centered
    animation
  >
    <Modal.Header closeButton
      style={{
        border: "none",
        paddingBottom: "0px",
      }}
    >
    </Modal.Header>
    <div className="d-flex flex-row pb-4 ps-4">
      <div
        className="mt-4"
        style={{
          width: "60%",
          height: "350px",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        {
          <Map
            bounds={bounds}
            setBounds={setBounds}
            center={{ lat: -1.286389, lng: 36.817223 }}
            zoom={mapZoom || 4}
          />
          // <GoogleMapReact
          //   bootstrapURLKeys={{ key: "AIzaSyBp0XgdcCh6jF9B2OJtsL1JtYvT5zdrllk" }}
          //   center={{
          //     lat: mapCenterLat,
          //     lng: mapCenterLon,
          //   }}
          //   defaultZoom={mapZoom || 4}
          //   // onClick={handleMapClick}
          //   yesIWantToUseGoogleMapApiInternals
          // >
          // </GoogleMapReact>
        }

      </div>
      <div className="d-flex flex-column justify-content-between"
        style={{
          width: "40%",
          padding: "20px",
        }}>
        <div>
          <p>
            <FormattedMessage id="LOCATION_ID" />
          </p>
          <p>
            <FormattedMessage id="LOCATION_ID_DESCRIPTION" />
          </p>
          <TreeSelect
            key={"treeselecttwo"}
            treeData={mapTreeData}
            value={store.locationId}
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

            dropdownStyle={{
              maxHeight: "500px",
              backgroundColor: "white",
              padding: 0,
              paddingBottom: "20px",
              overflow: "auto",
              zIndex: 9999,
            }}
          />
        </div>
        <div className="d-flex flex-row mt-4">
          <MainButton
            noArrow={true}
            backgroundColor={theme.primaryColors.primary500}
            color="white"
            className="btn btn-primary"
            onClick={() => {
              setModalShow(false);
            }}
          > <FormattedMessage id="DONE" /></MainButton>
          <MainButton
            noArrow={true}
            backgroundColor="white"
            color={theme.primaryColors.primary500}
            className="btn btn-primary"
            onClick={() => setModalShow(false)}
          > <FormattedMessage id="CANCEL" />
          </MainButton>
        </div>
      </div>
    </div>
  </Modal>
});