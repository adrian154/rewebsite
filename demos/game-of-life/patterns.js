const PATTERNS = {
    "Glider": ".x.\nx\nxxx",
    "Lightweight Space Ship": ".x..x\nx\nx...x\nxxxx",
    "R-Pentomino": ".xx\nxx\n.x",
    "Block-Laying Switch Engine #1": "......x\n....x.xx\n....x.x\n....x\n..x\nx.x",
    "Block-Laying Switch Engine #2": "xxx.x\nx\n...xx\n.xx.x\nx.x.x",
    "Block-Laying Switch Engine #3": "xxxxxxxx.xxxxx...xxx......xxxxxxx.xxxxx",
    "Gosper Glider Gun": "........................O\n......................O.O\n............OO......OO............OO\n...........O...O....OO............OO\nOO........O.....O...OO\nOO........O...O.OO....O.O\n..........O.....O.......O\n...........O...O\n............OO",
    "Space Rake": "...........OO.....OOOO\n.........OO.OO...O...O\n.........OOOO........O\n..........OO.....O..O\n\n........O\n.......OO........OO\n......O.........O..O\n.......OOOOO....O..O\n........OOOO...OO.OO\n...........O....OO\n\n\n\n..................OOOO\nO..O.............O...O\n....O................O\nO...O............O..O\n.OOOO",
    "Sir Robin": "....OO.........................\n....O..O.......................\n....O...O......................\n......OOO......................\n..OO......OOOO.................\n..O.OO....OOOO.................\n.O....O......OOO...............\n..OOOO....OO...O...............\nO.........OO...................\n.O...O.........................\n......OOO..OO..O...............\n..OO.......O....O..............\n.............O.OO..............\n..........OO......O............\n...........OO.OOO.O............\n..........OO...O..O............\n..........O.O..OO..............\n..........O..O.O.O.............\n..........OOO......O...........\n...........O.O.O...O...........\n..............OO.O.O...........\n...........O......OOO..........\n...............................\n...........O.........O.........\n...........O...O......O........\n............O.....OOOOO........\n............OOO................\n................OO.............\n.............OOO..O............\n...........O.OOO.O.............\n..........O...O..O.............\n...........O....OO.OOO.........\n.............OOOO.O....OO......\n.............O.OOOO....OO......\n...................O...........\n....................O..OO......\n....................OO.........\n.....................OOOOO.....\n.........................OO....\n...................OOO......O..\n....................O.O...O.O..\n...................O...O...O...\n...................O...OO......\n..................O......O.OOO.\n...................OO...O...OO.\n....................OOOO..O..O.\n......................OO...O...\n.....................O.........\n.....................OO.O......\n....................O..........\n...................OOOOO.......\n...................O....O......\n..................OOO.OOO......\n..................O.OOOOO......\n..................O............\n....................O..........\n................O....OOOO......\n....................OOOO.OO....\n.................OOO....O......\n........................O.O....\n............................O..\n........................O..OO..\n.........................OOO...\n......................OO.......\n.....................OOO.....O.\n........................OO..O.O\n.....................O..OOO.O.O\n......................OO.O..O..\n........................O.O..OO\n..........................OO...\n......................OOO....O.\n......................OOO....O.\n.......................OO...OOO\n........................OO.OO..\n.........................OO....\n.........................O.....\n...............................\n........................OO.....\n..........................O....",
    "Puffer 1": ".OOO......O.....O......OOO\nO..O.....OOO...OOO.....O..O\n...O....OO.O...O.OO....O\n...O...................O\n...O..O.............O..O\n...O..OO...........OO..O\n..O...OO...........OO...O",
    "Pentadecathlon": "..O....O\nOO.OOOO.OO\n..O....O",
    "Pulsar": "..OOO...OOO\n\nO....O.O....O\nO....O.O....O\nO....O.O....O\n..OOO...OOO\n\n..OOO...OOO\nO....O.O....O\nO....O.O....O\nO....O.O....O\n\n..OOO...OOO",
    "Big Glider": "...OOO\n...O..OOO\n....O.O\nOO.......O\nO.O....O..O\nO........OO\n.OO\n.O..O.....O.OO\n.O.........OO.O\n...O.O......OO..O\n....OO.O....OO...O\n........O.......O\n.......OOOO...O.O\n.......O.OO...OOOO\n........O...OO.O\n.............OO\n.........O.OOO\n..........O..O"
};