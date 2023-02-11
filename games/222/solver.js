// Possible moves
const U = 0, D = 1, L = 2, R = 3, B = 4, F = 5;

// Pieces of the cube
const ULB = 0,
      ULF = 1,
      URB = 2,
      URF = 3,
      DLB = 4,
      DLF = 5,
      DRB = 6,
      DRF = 7;

const doMove = (cube, face, degree) => {

    const corners = [
        [], // U
        [], // D
        [], // L
        [], // R
        [], // B
        []  // F
    ][face];

};