import React from "react";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import PlaceItem from "./PlaceItem";

import style from "./PlaceList.module.css";

const PlaceList = props => {
	if (props.items.length === 0) {
		return (
			<div className={`center ${style["place-list"]}`}>
				<Card>
					<h2>No places found. Maybe create one?</h2>
					<Button to="/places/new">Share Place</Button>
				</Card>
			</div>
		);
	}

	return (
		<ul className={`${style["place-list"]}`}>
			{props.items.map(place => (
				<PlaceItem
					key={place.id}
					id={place.id}
					image={place.image}
					title={place.title}
					description={place.description}
					address={place.address}
					creatorId={place.creator}
					coordinates={place.location}
					onDeletePlace={props.onDeletePlace}
				/>
			))}
		</ul>
	);
};

export default PlaceList;
