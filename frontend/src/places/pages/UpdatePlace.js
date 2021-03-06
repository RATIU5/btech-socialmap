import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { AuthContext } from "../../shared/context/auth-context";
import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";

import style from "./PlaceForm.module.css";

const UpdatePlace = () => {
	const authCtx = useContext(AuthContext);
	const { isLoading, error, sendRequest, clearError } = useHttpClient();
	const [loadedPlace, setLoadedPlace] = useState();
	const placeId = useParams().placeId;
	const history = useHistory();

	const [formState, inputHandler, setFormData] = useForm(
		{
			title: {
				value: "",
				isValid: false,
			},
			description: {
				value: "",
				isValid: false,
			},
		},
		false
	);

	useEffect(() => {
		const fetchPlace = async () => {
			try {
				const responseData = await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`
				);
				setLoadedPlace(responseData.place);
				setFormData(
					{
						title: {
							value: responseData.place.title,
							isValid: true,
						},
						description: {
							value: responseData.place.description,
							isValid: true,
						},
					},
					true
				);
			} catch (err) {}
		};
		fetchPlace();
	}, [sendRequest, placeId, setFormData]);

	const updateSubmitHandler = async event => {
		event.preventDefault();
		try {
			await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/places/${placeId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authCtx.token}`,
				},
				body: JSON.stringify({
					title: formState.inputs.title.value,
					description: formState.inputs.description.value,
				}),
			});
			history.push(`/${authCtx.userId}/places`);
		} catch (err) {}
	};

	if (isLoading) {
		return (
			<div className="center">
				<LoadingSpinner />
			</div>
		);
	}

	if (!loadedPlace && !error) {
		return (
			<div className="center">
				<Card>
					<h2>Could not find place!</h2>
				</Card>
			</div>
		);
	}

	return (
		<>
			<ErrorModal error={error} onClear={clearError} />

			{!isLoading && loadedPlace && (
				<form className={`${style["place-form"]}`} onSubmit={updateSubmitHandler}>
					<Input
						id="title"
						type="text"
						label="Title"
						validators={[VALIDATOR_REQUIRE()]}
						errorText="Please enter a valid title"
						onInput={inputHandler}
						initialValue={loadedPlace.title}
						initialValid={true}
					/>
					<Input
						id="description"
						label="Description"
						validators={[VALIDATOR_MINLENGTH(5)]}
						errorText="Please enter a description"
						onInput={inputHandler}
						initialValue={loadedPlace.description}
						initialValid={true}
					/>
					<Button type="submit" disabled={!formState.isValid}>
						Update Place
					</Button>
				</form>
			)}
		</>
	);
};

export default UpdatePlace;
