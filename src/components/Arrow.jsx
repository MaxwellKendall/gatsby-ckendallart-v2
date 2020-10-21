import React from 'react';

export default ({
    direction,
    onClick = () => {}
  }) => {
    if (direction === 'right') {
      return (
        <span
        className="mx-auto cursor-pointer rounded-full w-8 h-8 sqrl-pink flex items-center justify-center self-center md:ml-auto"
        onClick={onClick}>
          {`>`}
      </span>
      );
    }
    return (
      <span
        className="mx-auto cursor-pointer rounded-full w-8 h-8 sqrl-pink flex items-center justify-center self-center md:mr-auto"
        onClick={onClick}>
          {`<`}
      </span>
    );
  }
