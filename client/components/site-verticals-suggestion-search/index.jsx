/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { debounce, find, get, noop, trim } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SuggestionSearch from 'components/suggestion-search';
import { getHttpData, requestHttpData } from 'state/data-layer/http-data';
import { http } from 'state/data-layer/wpcom-http/actions';

export class SiteVerticalsSuggestionSearch extends Component {
	static propTypes = {
		initialValue: PropTypes.string,
		onChange: PropTypes.func,
		placeholder: PropTypes.string,
		charsToTriggerSearch: PropTypes.number,
	};

	static defaultProps = {
		initialValue: '',
		onChange: noop,
		placeholder: '',
		charsToTriggerSearch: 2,
	};

	constructor( props ) {
		super( props );
		this.state = {
			searchValue: props.initialValue,
		};
	}

	onSiteTopicChange = value => {
		value = trim( value );

		// Cancel delayed invocations in case of deletion.
		if ( ! value || value.length < this.props.charsToTriggerSearch ) {
			this.props.requestVerticals.cancel();
		}

		if (
			value &&
			value.length >= this.props.charsToTriggerSearch &&
			// Don't trigger a search if a non-user-defined input value is present in the verticals results.
			! find( this.props.verticals, { vertical_name: value, is_user_input_vertical: false } )
		) {
			this.props.requestVerticals( value );
		}

		this.setState( { siteTopicValue: value } );

		// Pluck out any match from the vertical list
		// otherwise return a default model
		const verticalData = find( this.props.verticals, { vertical_name: value } ) || {
			vertical_name: value,
			vertical_slug: value,
			is_user_input_vertical: true,
		};

		this.props.onChange( verticalData );
	};

	getSuggestions = () => this.props.verticals.map( vertical => vertical.vertical_name );

	render() {
		const { translate, placeholder } = this.props;

		return (
			<SuggestionSearch
				id="siteTopic"
				placeholder={
					placeholder || translate( 'e.g. Fashion, travel, design, plumber, electrician' )
				}
				onChange={ this.onSiteTopicChange }
				suggestions={ this.getSuggestions() }
				value={ this.state.searchValue }
			/>
		);
	}
}

const SITE_VERTICALS_REQUEST_ID = 'site-verticals-search-results';
const requestSiteVerticals = debounce(
	( searchTerm, limit = 5 ) => {
		return requestHttpData(
			SITE_VERTICALS_REQUEST_ID,
			http( {
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: '/verticals',
				query: {
					search: searchTerm,
					limit,
				},
			} ),
			{
				fromApi: () => data => [ [ SITE_VERTICALS_REQUEST_ID, data ] ],
				freshness: -Infinity,
			}
		);
	},
	333,
	{ leading: false, trailing: true }
);

export default localize(
	connect(
		() => {
			const siteVerticalsHttpData = getHttpData( SITE_VERTICALS_REQUEST_ID );
			return {
				isSearchPending: 'pending' === get( siteVerticalsHttpData, 'state', false ),
				verticals: get( siteVerticalsHttpData, 'data', [] ),
			};
		},
		() => ( { requestVerticals: requestSiteVerticals } )
	)( SiteVerticalsSuggestionSearch )
);
