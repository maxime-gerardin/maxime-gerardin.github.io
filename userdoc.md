# Comment remplir le fichier de configuration

## Description des types

- **String** : `"Text"`
- **Number** : `42`
- **Boolean** : `true` or `false`
- **Array** : `["Item 1", "Item 2", "Item 3"]`
- **Object** : `{ key1: "Value 1", key2: 123, key3: true, key4: ["List", "Inside", "Object"] }` \

Les chemins pour les images/icones (**String**) sont relatifs au dossier du projet. Indiquer :\
`"./static/assets/{chemin vers image}"`

## `portfolioTemplate` (Content)

### `info`

Informations générales du portfolio :

- **fullName** : Nom complet (String) *Exemple :* `"Maxime Gerardin"`
- **personalDescription** : Courte description personnel **(String)**
- **logo** : Chemin du fichier image du logo (`.jpg`, `.png`, etc.) **(String)**
- **logoCircle** : `true` pour un logo affiché en rond, `false` sinon **(Boolean)**
- **logoAlt** : Texte alternatif (affiché si pas d'image) pour le logo **(String)**


### `softwares`
Dictionnaire des outils utilisés dans les projets (avec logo)  
Il s'agit d'un dictionnaire avec comme clé **(String)** le texte à afficher pour l'outil et en valeur **(String)** le nom de l'image (à placer dans assets/icons/software)


### `socials`
Liste des réseaux sociaux.  
Chaque entrée est un **Object** avec ces clés:

- **text** : Nom du réseau (ex : `"Instagram"`) **(String)**
- **icon** : Chemin de l’icône associée **(String)**
- **url** : URL vers le profil du réseau en question **(String)**


### `projects`
Liste des projets.
Chaque projet est un **Object** avec ces clés :

- **name** : Nom du projet **(String)**
- **videoThumbnail** : Chemin vers l’aperçu vidéo **(String)**
- **ImgThumbnail** : Chemin vers l’aperçu image **(String)** (Si défini, affiché dans la vue projet à la place de la vidéo)
- **ImgMiniThumbnail** : Chemin vers l’aperçu image pour la vue multi projets **(String)** 
- **tags** : Liste de mots-clés (ex : `"3D"`, `"Animation"`) **(Array of String)**
- **year** : Année du projet **Number**
- **description** : Description rapide **(String)**
- **client** : Nom du client (mettre vide si projet perso)  **(String)**
- **links** *(peut être vide)* : Liste de liens externes  **(Array of Object)**
  - **url** : Lien complet  **(String)**
  - **text** : Texte affiché du lien **(String)**
- **medias** *(peut être vide)* : Liste d’images ou vidéos **(Array of Object)**
  - **src** : Chemin ou URL du média **(String)**
  - **type** : `"img"` ou `"video"` **(String)**
  - **text** : Texte descriptif (laisser vide si inutile) **(String)**
  - **controls** : `true` si vidéo avec contrôles manuels **(Boolean)**
  - **gridLine** : Numéro de la ligne dans la grille du media (Potentiellement plusieurs medias souhaités sur la même ligne en fonction du ratio) (Si la clé n'est pas présente, le media prendra toute la largeur de la grille et sera affiché à la suite) **(Number)**
- **software** *(peut être vide)* : Liste d'outils utilisés  **(Array of String)**
  Si le texte est trouvé dans le dictionnaires des outils, alors il prend l'image correspondante. Sinon il affiche juste le texte.


### `footer.contact`
Informations affichées dans le pied de page.  
Chaque entrée est un **Object** avec ces clés :

- **icon** : Chemin de l’icône **(String)**
- **url** : Lien cliquable (ex : `mailto:` pour les mails ou vide si pas de lien cliquable) **(String)**
- **text** : Texte affiché **(String)**


## `styleConfig` (Style)

### `portfolioFont` **Object**
Police utilisée sur le reste du site :

- **name** : Nom de la police (Google Fonts) **(String)**
- **weights** : Plage des graisses disponibles (Checker les graisses disponibles sur le site de Google fonts en fonction de la police souhaitée) **(String)**
- **useWeight** : Graisse utilisée (ex : `"400"`) **(String)**

### `fullNameFont` **Object**
Police utilisée pour le nom principal :

- **name** : Nom de la police (Google Fonts) **(String)**
- **weights** : Plage des graisses disponibles (Checker les graisses disponibles sur le site de Google fonts en fonction de la police souhaitée) **(String)**
- **useWeight** : Graisse utilisée (ex : `"900"`) **(String)**

### `projectDescriptionMaxLine` Number

Nombre max de lignes affichée pour la description d'un projet. \
Crée ensuite un bouton pour affiche toute la description (Par défaut 4)
