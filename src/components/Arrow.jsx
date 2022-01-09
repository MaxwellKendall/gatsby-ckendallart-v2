import { faCaretLeft, faCaretRight, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export default ({
    direction,
    classNames = '',
    onClick = () => {}
  }) => {
    if (direction === 'right') {
      return (
        <span
        className={`mx-auto cursor-pointer rounded-full w-12 h-12 sqrl-pink flex items-center justify-center self-center md:ml-auto ${classNames}`}
        onClick={onClick}>
          <FontAwesomeIcon icon={faChevronRight} />
      </span>
      );
    }
    return (
      <span
        className={`mx-auto cursor-pointer rounded-full w-12 h-12 sqrl-pink flex items-center justify-center self-center md:mr-auto ${classNames}`}
        onClick={onClick}>
          <FontAwesomeIcon icon={faChevronLeft} />
      </span>
    );
  }
