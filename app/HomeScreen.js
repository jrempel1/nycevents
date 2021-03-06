"use strict";

import React from "react";
import { ActivityIndicator, Platform } from "react-native";
import {
  Container,
  Header,
  Icon,
  Button,
  Text,
  Right,
  Item,
  Input
} from "native-base";
import EventList from "./components/EventList";
import SearchView from "./components/SearchView";
import { distance } from "./lib/Distance";
import { fetchAndStore } from "./lib/FetchStore";

const dataSource = "https://www.nycgovparks.org/xml/events_300_rss.json";
const mileRadius = 6;

export default class HomeScreen extends React.Component {
  static navigationOptions = { header: null };

  constructor() {
    super();

    this.state = {
      events: [],
      isLoading: true,
      error: null,
      searchVisible: false,
      latitude: null,
      longitude: null,
      filter: {
        searchText: null,
        limitGeo: false,
        limitDistance: mileRadius,
        categories: []
      }
    };

    this.rowSelect = this.rowSelect.bind(this);
    this.selectCategories = this.selectCategories.bind(this);
    this.toggleSearchLimitGeo = this.toggleSearchLimitGeo.bind(this);
    this.onTextChangeSearchLimitDistance = this.onTextChangeSearchLimitDistance.bind(
      this
    );
    this.onToggleCategory = this.onToggleCategory.bind(this);

    // if geo limiter, get the coordinates
    if (this.state.filter.limitGeo) {
      this.updateGeo();
    }
  }

  componentDidMount() {
    fetchAndStore(dataSource, eventData => {
      this.setState({
        isLoading: false,
        events: eventData
      });
    });
  }

  // toggle the searchLimitGeo state mutate
  toggleSearchLimitGeo() {
    const newSearchLimitGeo = !this.state.filter.limitGeo;
    if (newSearchLimitGeo) {
      this.updateGeo();
    }

    // mutate the state
    // todo is there a better way to do this?
    const newFilter = this.state.filter;
    newFilter.limitGeo = newSearchLimitGeo;
    this.setState({
      filter: newFilter
    });
  }

  onTextChangeSearchLimitDistance(searchLimitDistance) {
    // mutate the state

    const newFilter = this.state.filter;
    newFilter.limitDistance = searchLimitDistance;
    this.setState({
      filter: newFilter
    });
  }

  // update geo and notify state mutation
  updateGeo() {
    if (!this.state.filter.limitDistance) {
      const newFilter = this.state.filter;
      newFilter.limitDistance = mileRadius;
      this.setState({ filter: newFilter });
    }

    // get current location
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null
        });
      },
      error => this.setState({ error: error.message })
    );
  }

  rowSelect(selectedEvent) {
    const { navigate } = this.props.navigation;
    navigate("EventView", { event: selectedEvent });
  }

  selectCategories() {
    const { navigate } = this.props.navigation;

    // flatten, sort event categories
    const allCatArray = this.state.events
      .reduce((accum, element) => {
        return accum.concat(element.data);
      }, [])
      .reduce((accum, element) => {
        return accum.concat(element.categories);
      }, [])
      .reduce((accum, element) => {
        if (accum.indexOf(element) == -1 && element) {
          accum.push(element);
        }
        return accum;
      }, [])
      .sort();

    // object array {category, selected}
    const eventCatObjArray = allCatArray.map(v => {
      return {
        category: v,
        selected: this.state.filter.categories.includes(v)
      };
    });

    navigate("CategorySelect", {
      categories: eventCatObjArray,
      onToggleCategory: this.onToggleCategory
    });
  }

  onToggleCategory(newCategory) {
    let newFilter = this.state.filter;

    newFilter.categories = newCategory;

    this.setState({
      filter: newFilter
    });
  }

  // return filtered list of events
  getEventsFiltered() {
    return this.state.events
      .map(section => {
        return {
          title: section.title,
          data: section.data.filter(e => {
            // geo filter
            if (
              this.state.filter.limitGeo &&
              this.state.latitude &&
              this.state.longitude
            ) {
              // filter on current location
              const eventCoord = e.coordinates;

              if (
                distance(
                  eventCoord.latitude,
                  eventCoord.longitude,
                  this.state.latitude,
                  this.state.longitude
                ) > this.state.filter.limitDistance
              ) {
                return false;
              }
            }

            // category filter
            if (
              this.state.filter.categories.length > 0 &&
              e.categories.length > 0
            ) {
              let isCat = false;
              e.categories.forEach(c => {
                if (this.state.filter.categories.includes(c)) {
                  isCat = true;
                }
              });

              if (!isCat) {
                return false;
              }
            }

            // text filter
            if (this.state.filter.searchText) {
              const st = this.state.filter.searchText.toUpperCase();
              return (
                e.title.toUpperCase().includes(st) ||
                e.location.toUpperCase().includes(st) ||
                e.startdate.toUpperCase().includes(st)
              );
            }

            return true;
          })
        };
      })
      .filter(e => {
        // hide empty sections
        return e.data.length > 0;
      });
  }

  render() {
    const filteredEventList = this.getEventsFiltered();

    const currentEventsNumber = filteredEventList.reduce(
      (sum, value) => sum + value.data.length,
      0
    );

    const totalEventsNumber = this.state.events.reduce(
      (sum, value) => sum + value.data.length,
      0
    );

    return (
      <Container style={{ backgroundColor: "white" }}>
        <Header searchBar rounded>
          <Item>
            <Icon name="ios-search" />
            <Input
              placeholder="Search"
              onChangeText={searchText => {
                const newFilter = this.state.filter;
                newFilter.searchText = searchText;
                this.setState({ filter: newFilter });
              }}
            />
          </Item>

          <Right>
            <Button
              transparent
              onPress={() => {
                this.setState({
                  searchVisible: !this.state.searchVisible
                });
              }}
            >
              {Platform.OS === "ios"
                ? <Text>
                    {this.state.searchVisible ? "Less" : "More"}
                  </Text>
                : <Icon
                    name={
                      this.state.searchVisible
                        ? "md-arrow-round-up"
                        : "md-arrow-round-down"
                    }
                  />}
            </Button>
          </Right>
        </Header>
        {this.state.searchVisible &&
          <SearchView
            searchLimitGeo={this.state.filter.limitGeo}
            searchLimitDistance={this.state.filter.limitDistance}
            onTextChangeSearchLimitDistance={
              this.onTextChangeSearchLimitDistance
            }
            toggleSearchLimitGeo={this.toggleSearchLimitGeo}
            currentEventsNumber={currentEventsNumber}
            totalEventsNumber={totalEventsNumber}
            onSelectCategories={this.selectCategories}
          />}
        {this.state.error && <Text>Error loading event data</Text>}

        {this.state.isLoading &&
          <ActivityIndicator size="large" style={{ paddingTop: 150 }} />}

        <EventList events={filteredEventList} onPress={this.rowSelect} />
      </Container>
    );
  }
}
