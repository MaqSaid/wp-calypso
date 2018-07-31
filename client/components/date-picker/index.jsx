/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import DayPicker from 'react-day-picker';
import { noop, merge, map, filter, get } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import DayItem from 'components/date-picker/day';
import DatePickerNavBar from 'components/date-picker/nav-bar';

/* Internal dependencies
 */
class DatePicker extends PureComponent {
	static propTypes = {
		calendarViewDate: PropTypes.object,
		showOutsideDays: PropTypes.bool,
		numberOfMonths: PropTypes.number,
		events: PropTypes.array,
		selectedDays: PropTypes.array,
		disabledDays: PropTypes.array,
		locale: PropTypes.object,
		modifiers: PropTypes.object,
		moment: PropTypes.func.isRequired,

		selectedDay: PropTypes.object,
		timeReference: PropTypes.object,

		onMonthChange: PropTypes.func,
		onSelectDay: PropTypes.func,
		onDayMouseEnter: PropTypes.func,
		onDayMouseLeave: PropTypes.func,
		toMonth: PropTypes.object,
		fromMonth: PropTypes.object,
        onDayTouchStart: PropTypes.func,
		onDayTouchEnd: PropTypes.func,
		onDayTouchMove: PropTypes.func,
	};

	static defaultProps = {
		showOutsideDays: true,
		calendarViewDate: new Date(),
		modifiers: {},
		fromMonth: null,
		selectedDay: null,

		onMonthChange: noop,
		onSelectDay: noop,
		onDayMouseEnter: noop,
		onDayMouseLeave: noop,
		onDayTouchStart: noop,
		onDayTouchEnd: noop,
		onDayTouchMove: noop,
	};

	isSameDay( d0, d1 ) {
		d0 = this.props.moment( d0 );
		d1 = this.props.moment( d1 );

		return d0.isSame( d1, 'day' );
	}

	filterEventsByDay( day ) {
		if ( ! this.props.events ) {
			return [];
		}

		let i, event;
		const eventsInDay = [];

		for ( i = 0; i < this.props.events.length; i++ ) {
			event = this.props.events[ i ];

			if ( this.isSameDay( event.date, day ) ) {
				if ( typeof event.id === 'undefined' ) {
					event.id = `event-${ i }`;
				}

				eventsInDay.push( event );
			}
		}

		return eventsInDay;
	}

	locale() {
		const { moment } = this.props;
		const localeData = moment().localeData();
		const firstDayOfWeek = localeData.firstDayOfWeek();
		const weekdaysMin = moment.weekdaysMin();
		const weekdays = moment.weekdays();
		const locale = {
			formatDay: function( date ) {
				return moment( date ).format( 'llll' );
			},

			formatMonthTitle: function( date ) {
				return moment( date ).format( 'MMMM YYYY' );
			},

			formatWeekdayShort: function( day ) {
				return get( weekdaysMin, day, ' ' )[ 0 ];
			},

			formatWeekdayLong: function( day ) {
				return weekdays[ day ];
			},

			getFirstDayOfWeek: function() {
				return firstDayOfWeek;
			},

			formatMonthShort: function( month ) {
				return moment( month.toISOString() ).format( 'MMM' );
			},
		};

		return merge( locale, this.props.locale );
	}

	setCalendarDay = ( day, modifiers ) => {
		const momentDay = this.props.moment( day );

		if ( modifiers.disabled ) {
			return null;
		}

		const dateMods = {
			year: momentDay.year(),
			month: momentDay.month(),
			date: momentDay.date(),
		};

		const date = ( this.props.timeReference || momentDay ).set( dateMods );

		this.props.onSelectDay( date, dateMods, modifiers );
	};

	getDateInstance( v ) {
		if ( this.props.moment.isMoment( v ) ) {
			return v.toDate();
		}

		if ( v instanceof Number || typeof v === 'number' ) {
			return new Date( v );
		}

		return v;
	}

	renderDay = ( date, modifiers ) => (
		<DayItem
			date={ date }
			modifiers={ modifiers }
			onMouseEnter={ this.handleDayMouseEnter }
			onMouseLeave={ this.handleDayMouseLeave }
		/>
	);

	handleDayMouseEnter = ( date, modifiers, event ) => {
		const eventsByDay = this.filterEventsByDay( date );
		this.props.onDayMouseEnter( date, modifiers, event, eventsByDay );
	};

	handleDayMouseLeave = ( date, modifiers, event ) => {
		const eventsByDay = this.filterEventsByDay( date );
		this.props.onDayMouseLeave( date, modifiers, event, eventsByDay );
	};

	handleDayTouchMove = ( date, modifiers, event ) => {
		const eventsByDay = this.filterEventsByDay( date );
		this.props.onDayTouchMove( date, modifiers, event, eventsByDay );
	};

	render() {
		const modifiers = {
			...this.props.modifiers,
			'past-days': { before: new Date() },
			sunday: { daysOfWeek: [ 0 ] },
		};

		const hasDateRange =
			this.props.selectedDays && this.props.selectedDays.from && this.props.selectedDays.to;

		if ( this.props.selectedDay ) {
			modifiers[ 'is-selected' ] = this.getDateInstance( this.props.selectedDay );
		}

		if ( this.props.events && this.props.events.length ) {
			modifiers.events = map( filter( this.props.events, event => event.date ), event =>
				this.getDateInstance( event.date )
			);
		}

		if ( hasDateRange ) {
			modifiers[ 'range-start' ] = this.props.selectedDays.from;
			modifiers[ 'range-end' ] = this.props.selectedDays.to;
			modifiers.range = {
				from: this.props.selectedDays.from,
				to: this.props.selectedDays.to,
			};
		}

		const rootClassNames = classNames( {
			'date-picker': true,
			'date-picker--has-range': hasDateRange,
		} );

		return (
			<DayPicker
				modifiers={ modifiers }
				ref="daypicker"
				className={ rootClassNames }
				disabledDays={ this.props.disabledDays }
				month={ this.props.calendarViewDate }
				fromMonth={ this.props.fromMonth }
				toMonth={ this.props.toMonth }
				onDayClick={ this.setCalendarDay }
				onDayTouchStart={ this.setCalendarDay }
				onDayTouchEnd={ this.setCalendarDay }
				onDayTouchMove={ this.handleDayTouchMove }
				renderDay={ this.renderDay }
				localeUtils={ this.locale() }
				onMonthChange={ this.props.onMonthChange }
				showOutsideDays={ this.props.showOutsideDays }
				navbarElement={ <DatePickerNavBar /> }
				selectedDays={ this.props.selectedDays }
				numberOfMonths={ this.props.numberOfMonths }
			/>
		);
	}
}

export default localize( DatePicker );
