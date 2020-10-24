import React from 'react';

export default ({
    direction,
    classNames = '',
    onClick = () => {}
  }) => {
    if (direction === 'right') {
      return (
        <span
        className={`mx-auto cursor-pointer rounded-full w-8 h-8 sqrl-pink flex items-center justify-center self-center md:ml-auto ${classNames}`}
        onClick={onClick}>
          {`>`}
      </span>
      );
    }
    return (
      <span
        className={`mx-auto cursor-pointer rounded-full w-8 h-8 sqrl-pink flex items-center justify-center self-center md:mr-auto ${classNames}`}
        onClick={onClick}>
          {`<`}
      </span>
    );
  }
