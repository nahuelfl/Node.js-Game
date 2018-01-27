/********************************************************************************************
AUTEURS: Alice Dorion et Nahuel Londono
DATE: 18 Decembre 2017
NOM DU FICHIER: tp2-graphique.js
DESCRIPTION: Affichage Web du jeu Node Runner.

*Note*: Ce programme ne fait aucune validation d'input
*********************************************************************************************/

function decouperEnLignes(contenu) //Decoupe en lignes un texte passe en parametre.
{
    var lignes = contenu.split("\n");

    if (lignes[lignes.length-1] == "") 
    {
        lignes.pop();
    }
    return lignes;
}

function text2Array(texte)  //Cette fonction transforme un texte en tableau
{
    var tab = [];
    
    for (var i=0; i<texte.length; i++)
    {
        tab.push(texte[i].split(","));
    }
    
    return tab;
}

function genererTable(width, height) //Genere un <table> HTML a taille specifique selon width et heigth
{
    var nbCellules = '<table id="table">';

    for(var i=0; i<height; i++)
    {
        nbCellules += '<tr>';
        for(var j=0; j<width; j++)
        {
            var num = i + '-' + j;
            nbCellules += '<td id=' + '\'' + num + '\'' + '</td>';
        }
        nbCellules += '</tr>';
    }
    
    nbCellules += '</table>';
    
    return nbCellules;
}

function draw(map) 
{
    //La map du niveau est mise dans une variable (map est une chaîne de caracteres ASCII)
    var map = map;

    //Traitements sur le map
    var mapEnLignes = decouperEnLignes(map);
    var nbLignes = mapEnLignes.length;
    var longeurLigne = mapEnLignes[0].length; 
   
   //Generation de la table
    var container = document.getElementById('grid');
    var table = genererTable(longeurLigne, nbLignes);
    container.innerHTML = table;

    //Affichage de chaque image selon son caractere ASCII associe
    for(var i=0; i<nbLignes; i++) 
    {
        for(var j=0; j<longeurLigne; j++) 
        {
            var mapEnLignesArray = text2Array(mapEnLignes[i]);
            var nomImage;
            var elementMap = mapEnLignesArray[j];
        
            if(mapEnLignesArray[j] == "#" ) //Le caractere '#' a une autre fonctionnalite en HTML donc on doit le changer
                var nomImage = '%23';
            else 
                var nomImage = mapEnLignesArray[j];

            var img = 'url("img/' + nomImage + '.png';  //Lien URL vers chaque image
            document.getElementById(i + '-' + j).style.backgroundImage = img;   //Affichage de l'image specifiee

        }
    }
}
