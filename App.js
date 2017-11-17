import React from 'react';
import { Alert, Button, StyleSheet, Text, View, Platform} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import { Permissions, Location, Gyroscope } from 'expo';
import isEqual from 'lodash/isEqual';

export default class App extends React.Component {
  state = {
      location: {
        coords: {
          latitude: 37.78825,
          longitude: -122.4324,
        },
      },
      initialized: false,
  };

  _getLocationRegion = () => {
    return Object.assign(
      {},
      this.state.mapRegion, 
      this.state.location.coords,      
    );
  };

   _getLocationAsync = async () => {
    let location = await Location.getCurrentPositionAsync({});
    this.setState({location});
  };

  _centerRegion = () => {
    console.log('Setting center view');

    let region = Object.assign ( 
                    { latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421, },
                    this.state.location.coords )

    this.setState({mapRegion: region});
  }

  _centerView = () => {
    let mapRegion = Object.assign({}, this.state.mapRegion, this.state.location.coords)
    this.setState({mapRegion})
  }

  _getRegion = () => {
    return this.state.mapRegion;
  };

  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };

  componentDidMount = () => {
    this.mounted = true;
    this.watchLocation();
  }

  watchLocation = () => {
    console.log('Watch Location')
    // eslint-disable-next-line no-undef
    this.watchID = Location.watchPositionAsync(
      { enableHighAccuracy: true, timeInterval: 100, distanceInterval: 1 },
      (position) => {
        if (!isEqual(this.state.location.coords, position.coords)) {
          this.setState({ location: position });
        }
        if (!this.state.initialized) {
          this.setState({initialized: true});
          this._centerRegion()
        }
      });

    this.heading = Location.watchHeadingAsync(
      (heading) => {
        this.setState({ heading: heading.trueHeading});
      });
  };
  
  componentWillUnmount = () => {
    this.mounted = false;
    // eslint-disable-next-line no-undef
    this.watchID.remove();
    this.heading.remove();
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    this.setState({
      location: location,
      locationResult: JSON.stringify(location),
    });
  };

  _handleButton = () => {
    console.log('Resetting view');
    this._centerRegion();
  };


  _onRegionChange = () => {
    console.log('Region changed');
  };

  render() {
    let heading = this.state.heading
    const rotate = (typeof heading === 'number' && heading >= 0) ? `${heading}deg` : null;

    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={this._getRegion()}
          onRegionChange={this._handleMapRegionChange}
        >
          <MapView.Marker
            anchor={ANCHOR}
            style={styles.mapMarker}
            coordinate={this.state.location.coords}
          >
            <View style={styles.containerMarker}>
              <View style={styles.markerHalo} />
              {rotate &&
                <View style={[styles.heading, { transform: [{ rotate }] }]}>
                  <View style={styles.headingPointer} />
                </View>
              }
              <View style={styles.marker}>
                <Text style={{ width: 0, height: 0 }}>
                  {rotate}
                </Text>
              </View>
            </View>
          </MapView.Marker>
        </MapView>

        <Text style={styles.debug_text}>
          {JSON.stringify(this.state.gyroscopeData)}
        </Text>
        <Text style={styles.debug_text}>
          {JSON.stringify(this.state.location)}
        </Text>
        <Button
          title='Reset View'
          onPress={this._handleButton}
        />
        <Button
          title='Center View'
          onPress={this._centerView}
        />
      </View>
    );
  }
}

const ANCHOR = { x: 0.5, y: 0.5 };

const colorOfmyLocationMapMarker = 'blue';
const SIZE = 15;
const HALO_RADIUS = 6;
const ARROW_SIZE = 7;
const ARROW_DISTANCE = 6;
const HALO_SIZE = SIZE + HALO_RADIUS;
const HEADING_BOX_SIZE = HALO_SIZE + ARROW_SIZE + ARROW_DISTANCE;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  debug_text: {
    color: 'red',
    fontWeight: 'bold',
  },
  mapMarker: {
    zIndex: 1000,
  },
  // The container is necessary to protect the markerHalo shadow from clipping
  containerMarker: {
    width: HEADING_BOX_SIZE,
    height: HEADING_BOX_SIZE,
  },
  heading: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: HEADING_BOX_SIZE,
    height: HEADING_BOX_SIZE,
    alignItems: 'center',
  },
  headingPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: ARROW_SIZE * 0.75,
    borderBottomWidth: ARROW_SIZE,
    borderLeftWidth: ARROW_SIZE * 0.75,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colorOfmyLocationMapMarker,
    borderLeftColor: 'transparent',
  },
  markerHalo: {
    position: 'absolute',
    backgroundColor: 'white',
    top: 0,
    left: 0,
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: Math.ceil(HALO_SIZE / 2),
    margin: (HEADING_BOX_SIZE - HALO_SIZE) / 2,
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
  marker: {
    justifyContent: 'center',
    backgroundColor: colorOfmyLocationMapMarker,
    width: SIZE,
    height: SIZE,
    borderRadius: Math.ceil(SIZE / 2),
    margin: (HEADING_BOX_SIZE - SIZE) / 2,
  },
});

