import React, { Component } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet,TextInput, Image, ScrollView, ListView} from 'react-native';
import ItemDetails from './ItemDetails';
import Pieces from './Pieces';
import GLOBAL from '../Globals';
import GlobalStyles from '../GlobalStyles';
import LocationInformation from './LocationInformation';
import ImageHelper from '../helpers/ImageHelper';
import * as Keychain from 'react-native-keychain';

const default_image = require("../sources/default_controller_icon.imageset/default_controller_icon.png");
const styles = GlobalStyles;

export default class ControllerForm extends Component{

	constructor(props) {
		super(props);

		var global_route = GLOBAL.BASE_URL + props.image_route + props.item_id;
		
		this.state = {
			edit_mode : false,
			connections : new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}) 
		}
	}

	componentDidMount() {
		this.getConnectionsFetch();	
	}

	getConnectionsFetch(){
		Keychain
			  	.getGenericPassword()
			  	.then((credentials) => {
				    var headers = new Headers({
						'Accept': 'application/json',
						'Content-Type': 'application/x-www-form-urlencoded',
						'username': credentials.username,
						'password': credentials.password
					});
					fetch(GLOBAL.BASE_URL + 'device/getconnections/' + this.props.item_id, {
						method: 'GET',
						headers: headers,
					})
					.then((response) => response.json())
					.then((responseJson) => {
					  	var data = responseJson.data;

					  	if(data){
				  		  	this.setState({       
						  		connections : this.state.connections.cloneWithRows(data.connections)
						  	});      
					  	}      
					})
					.catch((error) => {
						console.warn(error);
					});
			  	}).catch(function(error) {
			    console.log('Keychain couldn\'t be accessed! Maybe no value set?', error);
			}
		);
	}


	renderConnection(connection){
		return (
			<View style={styles.row}>
				<View style={styles.item_name_container}>
					<Text style={styles.item_name}>
						Endpoint: 
					</Text>
				</View>						
				<View style={styles.item_input_container}>
					<Text style={styles.item_input}>
						{connection.target_name}
					</Text>
				</View>
			</View>						
		)
	}

	render(){

		var edit_mode = this.state.edit_mode;
		var controller = this.props.route.controller;
		
		var next_route = this.props.route.index;
		var data = {
			item_name: controller.device_name,
			item_description: controller.device_description,
			title:"CONTROLLER DETAILS",
			item_type: controller.device_type_id
		};

		return (
			<View>
				<ScrollView style={{marginTop:10}}>
					<View style={styles.thumbnail_container} >
						<ImageHelper 
						 	id={this.props.item_id}
						 	route={this.props.image_route}
						 	styles={styles.thumbnail}
						 	defaultImage={default_image}
						/>
					</View>
					<View>
						<ItemDetails type={true} data={data}/>
					</View>
					<View>
						<LocationInformation 
							edit_mode={edit_mode} 
							data={this.props}
						/>
					</View>
					<View>
						<View style={styles.item_title_container}>
							<Text style={styles.item_title}>MORE INFORMATION</Text>
						</View>						
						<View style={styles.row}>
							<View style={styles.item_name_container}>
							</View>						
							<View style={styles.item_input_container}>
								<Text style={styles.item_input}>
									Check-In-History
								</Text>
							</View>
						</View>						
					</View>
					<View>
						<View style={styles.item_title_container}>
							<Text style={styles.item_title}>CONNECTIONS</Text>
						</View>
						{this.state.connections.getRowCount() > 0 && 
							<ListView 
								dataSource={this.state.connections}
								renderRow={(connection) => this.renderConnection(connection)}
								enableEmptySections={true}
							/>        
						}
					</View>
					<View>
						<View style={styles.item_title_container}>
							<Text style={styles.item_title}>SETTINGS</Text>
						</View>	
					</View>
				</ScrollView>
			</View>
		);
	}
}
