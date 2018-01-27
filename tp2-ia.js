/********************************************************************************************
AUTEURS: Alice Dorion et Nahuel Londono
DATE: 18 Decembre 2017
NOM DU FICHIER: tp2-ia.js
DESCRIPTION: Intelligence artificielle qui résoud le jeu Node Runner.

*Note*: Ce programme ne fait aucune validation d'input
*********************************************************************************************/

var room = "nahuelfl";

var grid;   //Grille du jeu
var nbCols; //Nombre de colonnes
var nbGold; //Nombre de lingots d'or

//Retourne true si x est un element du tableau
function contient(tab, x)
{
    for (var i=0; i<tab.length; i++)
    {
        if(tab[i] == x)
            return true;
    }
    return false;
}

//Compte le nombre de lingots d'or se trouvant initialement dans le niveau
function findGold (listCells) 
{
    var numberOfGold = 0;
    for (var i=0; i<listCells.length; i++)
    {
        if(listCells[i] == '$')
            numberOfGold++;
    }
    
    return numberOfGold;
}

//Retourne un tableau contenant les cases adjacentes a cell vers lesquelles il est possible de se deplacer a partir de cell
function adjacent(listCells,cell,nbRows) 
{
    var adjacentCells = [];
    var col = cell % nbCols;
    var row = Math.floor(cell/nbCols);
    var symbol = listCells[cell];
    var symbolBelow = listCells[cell+nbCols];

    if(symbol != '#')
    {
        //Possibilite d'aller en haut
        if(row>0 && symbol == 'H')
            adjacentCells.push(cell-nbCols);

        //Possibilite d'aller  a gauche
        if(col>0 && listCells[cell-1] != '#') 
        {
            if(symbol == '-' || symbol == 'H' || (row<nbRows-1 && (symbolBelow == '#' || symbolBelow == 'H')))
               adjacentCells.push(cell-1);
        }

        //Possibilite d'aller en bas
        if(row<nbRows-1 && symbolBelow != '#')
            adjacentCells.push(cell+nbCols);

        //Possibilite d'aller a droite
        if(col<nbCols-1 && listCells[cell+1] != '#') 
        {
            if(symbol == '-' || symbol == 'H' || (row<nbRows-1 && (symbolBelow == '#'||symbolBelow == 'H')))
               adjacentCells.push(cell+1);
        }
    }

    return adjacentCells;
}

/**
 * La fonction start() est appelee au debut
 * d'un niveau et recoit en parametre la grille
 * initiale sous forme de chaÃ®ne de caracteres
 *
 * Les symboles sont :
 *   # : brique
 *   & : position initiale du joueur
 *   $ : sac d'or
 *   H : echelle
 *   - : corde
 *   S : sortie
 *   espace vide : rien de special sur cette case
 */

function start(map) 
{
    var mat = map.split("\n");  //La map du niveau est transformée en array
    
    if (mat[mat.length-1]=='')  
        mat.pop();
    
    var nbRows = mat.length; //Nombre de lignes

    nbCols = mat[0].length;
    
    var listCells = []; 

    for(var i=0; i<nbRows; i++) //Met chaque caractere ASCII du map comme element de listCells
    {
        for(var j=0; j<nbCols; j++)
        {
            listCells.push(mat[i].charAt(j));
        }
    }

    nbGold = findGold(listCells);   //Compte le nombre de lingots d'or dans listCells
    
    grid = [];
    
    function addCell(symbol, adjacentCells) 
    {
        grid.push({symbol: symbol, adjacentCells: adjacentCells});
    }

    for (var i=0; i<nbCols*nbRows; i++)
    {
        addCell(listCells[i],adjacent(listCells,i,nbRows));
    }
    
}

//Effectue une recherche breadth-first pour trouver le chemin le plus court entre la case actuelle et une case interessante. La fonction retourne le numero de la case vers laquelle on devrait se deplacer
function seek(initialCase, interesting) 
{
    var found = false;
    var front = [initialCase]; //Prochaines cases a examiner, en ordre
    var levels = {}; //Profondeur des cases dans la fouille
    levels[""+initialCase] = 0; 
    var checked = []; //Tableau des cases deja examinees
    var checking; //Noeud examine
    var tree = {}; //Les relations enfant-parent dans la fouille
    var children; //Case adjacente a laquelle on peut se rendre a partir de la case actuelle.
    var child; //Un des children; valeur a retourner
    
    while(!found)   //À faire tant qu'on ne trouve pas une cellule interessante
    {
        checking = front.pop(); //Enleve le dernier element de front
        checked.push(checking);
        
        children= grid[checking].adjacentCells;
        
        for(var i=0; i<children.length; i++)
        {
            child = children[i];

            if(!contient(checked,child))    //Si la cellule n'a pas ete deja verifiee
            {
                if(!contient(front,child))
                    front = [child].concat(front);

                tree[""+child] = ""+checking;
                levels[""+child] = levels[""+checking]+1;

                if(grid[child].symbol == interesting)
                {
                    found = true;
                    break;
                }
            }
        }     
    }

    //Remonter l'arbre 
    while (levels[""+child]>1) 
    {
        child = tree[""+child];
    }
    
    return child;
}

//Retourne la direction(chiffre de 1 a 4) vers laquelle avancer selon le numero de la case actuelle et celle qui suit
function findDirection(x,y,next)
{
    var dir;
    var nextX = next % nbCols;
    var nextY = Math.floor(next/nbCols);
    
    //La prochaine case se situe dans la meme colonne que la case actuelle:
    if(nextX == x)
    {
        if(nextY == y-1)
            dir = 1;
        else
            dir = 3;
    }

    //Ou a gauche
    else if(nextX == x-1)
        dir = 2;

    //Ou a droite
    else
        dir = 4;   
    
    return dir;
}

/**
 * La fonction `next` est appelee automatiquement A
 * chaque tour et doit retourner un enregistrement
 * de la forme :
 *   {event: ..., direction: ...}
 *
 *  : - event est un des deux evenements "move", pour
 *        se deplacer ou "dig" pour creuser
 *      - direction est une des 4 directions haut/gauche/bas/droite,
 *        representee par un nombre : 1 pour haut, 2 pour gauche, ...
 *
 * Le parametre `state` est un enregistrement contenant la position
 * du runner au tour actuel sous la forme :
 *
 *     {runner: {position: {x: ..., y: ...}}}
 */

function next(state) 
{
    var dir;    //Numero de direction (numeros expliques precedemment)
    var x = state.runner.position.x;    
    var y = state.runner.position.y;    
    var initialCase = x + y * nbCols;
    var nextCase;
    
    //Si on a trouve un lingot d'or, modifier la grille et le nombre de lingots restants.
    if(grid[initialCase].symbol == '$')
    {
        grid[initialCase].symbol = ' ';
        nbGold--;
    }
    
    //Chercher tous les lingots d'or avant de chercher la sortie
    if(nbGold > 0)
        nextCase = seek(initialCase,'$');
    else
        nextCase = seek(initialCase,'S');
    
    dir = findDirection(x,y,nextCase);

    return {event: "move", direction: dir};
}

// XXX Important : ne pas modifier ces lignes
module.exports.room = room;
module.exports.start = start;
module.exports.next = next;
