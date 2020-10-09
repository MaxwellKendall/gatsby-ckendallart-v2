import React from 'react';

export default ({
    direction,
    onClick = () => {}
  }) => {
    if (direction === 'right') {
      return (
        <span
        className="mx-auto cursor-pointer rounded-full w-10 sqrl-pink flex h-10 items-center justify-center self-center lg:w-20 lg:h-20 md:ml-auto"
        onClick={onClick}>
          {`>`}
      </span>
      );
    }
    return (
      <span
        className="mx-auto cursor-pointer rounded-full w-10 sqrl-pink flex h-10 items-center justify-center self-center lg:w-20 lg:h-20 md:mr-auto"
        onClick={onClick}>
          {`<`}
      </span>
    );
  }
