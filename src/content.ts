export type WorldId = 'forest' | 'numbers' | 'village' | 'island' | 'castle';
export type Activity =
  | { id: string; kind: 'choice'; prompt: string; choices: string[]; answer: string; hint: string; speak?: string }
  | { id: string; kind: 'collect'; prompt: string; tokens: string[]; answer: string[]; hint: string }
  | { id: string; kind: 'order'; prompt: string; tokens: string[]; answer: string[]; hint: string; speak?: string }
  | { id: string; kind: 'match'; prompt: string; pairs: [string, string][]; hint: string }
  | { id: string; kind: 'count'; prompt: string; object: string; quantity: number; choices: number[]; hint: string }
  | { id: string; kind: 'memory'; prompt: string; pairs: [string, string][]; hint: string }
  | { id: string; kind: 'explore'; prompt: string; objects: string[]; answer: string[]; hint: string };

export interface Level { id: string; title: string; story: string; activities: Activity[]; reward: string }
export interface World { id: WorldId; name: string; subtitle: string; guide: string; color: string; levels: Level[] }

const choice = (prompt: string, choices: string[], answer: string, hint: string, speak?: string): Activity => ({ id: '', kind: 'choice', prompt, choices, answer, hint, speak });
const collect = (prompt: string, tokens: string[], answer: string[], hint: string): Activity => ({ id: '', kind: 'collect', prompt, tokens, answer, hint });
const order = (prompt: string, tokens: string[], answer: string[], hint: string, speak?: string): Activity => ({ id: '', kind: 'order', prompt, tokens, answer, hint, speak });
const match = (prompt: string, pairs: [string, string][], hint: string): Activity => ({ id: '', kind: 'match', prompt, pairs, hint });
const count = (prompt: string, object: string, quantity: number, choices: number[], hint: string): Activity => ({ id: '', kind: 'count', prompt, object, quantity, choices, hint });
const memory = (prompt: string, pairs: [string, string][], hint: string): Activity => ({ id: '', kind: 'memory', prompt, pairs, hint });
const explore = (prompt: string, objects: string[], answer: string[], hint: string): Activity => ({ id: '', kind: 'explore', prompt, objects, answer, hint });
const level = (title: string, story: string, reward: string, ...activities: Activity[]): Level => ({ id: '', title, story, reward, activities });

const raw: World[] = [
  {
    id: 'forest', name: 'La Forêt des Lettres', subtitle: 'Les sons prennent vie', guide: 'Lila la chouette', color: '#6c9a77',
    levels: [
      level('La clairière des voyelles', 'Lila cherche les cinq lucioles voyelles pour rallumer sa lanterne.', 'Lanterne des voyelles',
        collect('Touche toutes les voyelles.', ['A','M','E','T','I','O','L','U'], ['A','E','I','O','U'], 'Les voyelles sont A, E, I, O et U.'),
        choice('Quelle lettre est une voyelle ?', ['B','E','R'], 'E', 'E est une voyelle. Écoute son nom.', 'E'),
        match('Relie chaque voyelle à sa petite sœur.', [['A','a'],['E','e'],['I','i']], 'La grande et la petite lettre portent le même nom.'),
        choice('Écoute et retrouve la lettre.', ['O','A','U'], 'O', 'La lettre O fait « o ».', 'O'),
        collect('Aide Lila : ramasse les voyelles qui brillent.', ['i','p','u','n','a','m'], ['i','u','a'], 'Cherche i, u et a.')),
      level('Les consonnes du sentier', 'Les arbres cachent les premières consonnes du chemin.', 'Broche du sentier',
        collect('Trouve les consonnes du sentier.', ['M','A','L','E','R','S','T','O'], ['M','L','R','S','T'], 'M, L, R, S et T sont des consonnes.'),
        match('Relie les grandes et les petites lettres.', [['M','m'],['L','l'],['R','r'],['S','s'],['T','t']], 'Le nom reste le même.'),
        choice('Quelle lettre commence « maman » ?', ['M','L','R'], 'M', 'Maman commence par M.', 'maman')),
      level('La source des sons', 'Chaque bulle chante un son. Aide Lila à les reconnaître.', 'Bulle musicale',
        choice('Écoute : quelle lettre entends-tu ?', ['M','L','S'], 'M', 'Le son « mmm » vient de M.', 'mmm'),
        match('Associe la lettre au début du mot entendu.', [['M','moto'],['L','lune'],['S','sac']], 'Écoute le premier son de chaque mot.'),
        choice('Quel mot commence par le son « l » ?', ['sac','lune','moto'], 'lune', 'Lune commence par L.', 'lune')),
      level('Les syllabes des champignons', 'Les champignons ouvrent leur chapeau quand on lit leurs syllabes.', 'Chapeau de champignon',
        choice('Quelle syllabe entends-tu ?', ['ma','la','sa'], 'ma', 'M avec A fait « ma ».', 'ma'),
        match('Associe les deux syllabes identiques.', [['MA','ma'],['LI','li'],['SO','so']], 'Lis les lettres ensemble.'),
        collect('Touche les syllabes avec M.', ['ma','lu','mi','so','mo'], ['ma','mi','mo'], 'M est au début de ma, mi et mo.')),
      level('Le moulin à syllabes', 'Deux roues du moulin assemblent les sons.', 'Petit moulin',
        order('Construis « mama » avec les syllabes.', ['ma','ma'], ['ma','ma'], 'Lis ma puis ma.'),
        order('Construis « sali ».', ['li','sa'], ['sa','li'], 'Sa puis li.'),
        match('Relie les syllabes pour former le mot.', [['la','lama'],['li','lili'],['mo','moto']], 'Écoute le début des mots.')),
      level('Les mots du hérisson', 'Le hérisson a perdu les étiquettes de ses objets.', 'Étiquette dorée',
        choice('Lis le mot qui nomme cet objet : @sac', ['sac','lac','sel'], 'sac', 'S A C : sac.', 'sac'),
        order('Remets les lettres de « LAC » dans l’ordre.', ['C','L','A'], ['L','A','C'], 'L puis A puis C.'),
        choice('Quel mot lis-tu ?', ['moto','matin','maison'], 'moto', 'Mo puis to : moto.', 'moto')),
      level('Les étiquettes illustrées', 'La cabane des images a besoin de ses mots.', 'Album d’images',
        match('Relie chaque mot à son dessin.', [['sac','@sac'],['lit','@lit'],['bol','@bol']], 'Dis le mot à voix haute.'),
        choice('Quel mot va avec le dessin ? @bol', ['bol','sol','vol'], 'bol', 'On mange dans un bol.', 'bol'),
        match('Range les nouvelles étiquettes.', [['moto','@moto'],['lune','@lune'],['chat','@chat']], 'Observe la forme puis lis.')),
      level('Le livre à trous', 'Des lettres se sont envolées des pages.', 'Plume d’écriture',
        choice('Complète : _AC', ['S','M','L'], 'S', 'SAC commence par S.', 'sac'),
        choice('Complète : LU_E', ['N','M','R'], 'N', 'LUNE contient N.', 'lune'),
        order('Reconstruis « MOTO ».', ['O','M','T','O'], ['M','O','T','O'], 'Mo puis to.')),
      level('Les phrases du renard', 'Le renard lit de courtes phrases pour retrouver son ami.', 'Marque-page',
        order('Range les mots : « Le chat dort. »', ['dort.','Le','chat'], ['Le','chat','dort.'], 'La phrase commence par Le.'),
        choice('Lis : « Lila a un sac. » Qui a un sac ?', ['Lila','Nour','Le chat'], 'Lila', 'La phrase commence par Lila.', 'Lila a un sac.'),
        choice('Quelle phrase parle de la lune ?', ['La lune brille.','Le chat dort.','La moto roule.'], 'La lune brille.', 'Écoute chaque phrase.')),
      level('L’histoire de la forêt', 'Une histoire courte révèle le secret du grand arbre.', 'Livre de la forêt',
        choice('Écoute : « Lila voit un chat. Le chat dort sous un arbre. » Qui dort ?', ['Lila','Le chat','Nour'], 'Le chat', 'Le chat dort sous un arbre.', 'Lila voit un chat. Le chat dort sous un arbre.'),
        choice('Où dort le chat ?', ['Sous un arbre','Dans une maison','Sur un bateau'], 'Sous un arbre', 'Écoute encore l’histoire.'),
        order('Remets l’histoire dans l’ordre.', ['Le chat dort.','Lila voit un chat.'], ['Lila voit un chat.','Le chat dort.'], 'Lila voit d’abord le chat.'))
    ]
  },
  {
    id: 'numbers', name: 'Le Royaume des Nombres', subtitle: 'Des trésors à compter', guide: 'Milo le renard', color: '#e8a65f',
    levels: [
      level('Le jardin des cinq pommes', 'Le jardinier a besoin de compter sa récolte.', 'Panier de pommes',
        count('Compte les pommes.', 'pomme', 3, [2,3,4], 'Touche chaque pomme une fois en comptant.'),
        count('Combien de ballons ?', 'ballon', 5, [4,5,3], 'Un, deux, trois, quatre, cinq.'),
        count('Que reste-t-il dans le panier vide ?', 'pomme', 0, [0,1,2], 'Il n’y a aucun objet : c’est zéro.')),
      level('Les chiffres du marché', 'Le marchand range les étiquettes de 0 à 10.', 'Étiquette du marché',
        order('Place les nombres dans l’ordre.', ['3','1','2'], ['1','2','3'], 'Après 1 vient 2, puis 3.'),
        count('Combien d’étoiles ?', 'etoile', 7, [6,7,8], 'Compte lentement chaque étoile.'),
        choice('Quel nombre vient après 9 ?', ['8','10','7'], '10', 'Après 9 vient 10.')),
      level('Le pont des quantités', 'Trois pierres aideront à réparer le pont du royaume.', 'Pierre du pont',
        choice('Quel groupe est le plus grand ? 4 ou 6 ?', ['4','6'], '6', 'Six, c’est plus que quatre.'),
        count('Compte les cubes de la rive.', 'cube', 8, [7,8,9], 'Pointe les cubes un à un.'),
        choice('Quel nombre est le plus petit ? 3 ou 5 ?', ['3','5'], '3', 'Trois vient avant cinq.')),
      level('L’addition des étoiles', 'Chaque bonne addition allume une étoile du château.', 'Étoile d’addition',
        choice('2 pommes et 1 pomme. Combien de pommes ?', ['2','3','4'], '3', 'Compte 2, puis encore 1 : 3.'),
        choice('3 + 2 = ?', ['4','5','6'], '5', 'Trois et encore deux font cinq.'),
        count('Regarde ces étoiles avant le calcul : combien y en a-t-il ?', 'etoile', 6, [5,6,7], 'Compte les étoiles une par une.')),
      level('Le coffre des retraits', 'Retirer des objets ouvre le coffre.', 'Clé du coffre',
        choice('5 pommes, on en retire 2. Combien restent ?', ['2','3','4'], '3', 'Cinq, moins deux, font trois.'),
        choice('4 - 1 = ?', ['2','3','4'], '3', 'Enlève une unité de quatre.'),
        choice('6 - 3 = ?', ['2','3','4'], '3', 'Six moins trois font trois.')),
      level('La tour de vingt', 'La tour s’élève au rythme des nombres.', 'Fanion de la tour',
        choice('Quel nombre vient après 14 ?', ['13','15','16'], '15', 'Après quatorze vient quinze.'),
        order('Range les nombres.', ['12','10','11'], ['10','11','12'], 'Dix, onze, douze.'),
        choice('10 et encore 7, cela fait…', ['17','16','18'], '17', 'Une dizaine et sept unités font dix-sept.')),
      level('Les compléments du pont', 'Trouve les pierres manquantes pour atteindre dix.', 'Arche de dix',
        choice('6 + ? = 10', ['3','4','5'], '4', 'Compte de six jusqu’à dix : il manque quatre.'),
        choice('8 + ? = 10', ['1','2','3'], '2', 'Huit et deux font dix.'),
        choice('9 + 3 = ?', ['11','12','13'], '12', 'Neuf et un font dix, puis encore deux : douze.')),
      level('La route de trente', 'Des panneaux marquent le chemin jusqu’à trente.', 'Panneau de route',
        choice('Quel nombre vient après 29 ?', ['28','30','31'], '30', 'Après vingt-neuf vient trente.'),
        order('Range ces nombres.', ['22','20','21'], ['20','21','22'], 'Vingt, vingt et un, vingt-deux.'),
        choice('2 dizaines et 5 unités font…', ['20','25','52'], '25', 'Deux dizaines, c’est vingt. Ajoute cinq.')),
      level('Le train de soixante', 'Le train avance de dizaine en dizaine.', 'Billet du train',
        order('Range les dizaines.', ['50','30','40'], ['30','40','50'], 'Trente, quarante, cinquante.'),
        choice('Quel nombre vient après 59 ?', ['58','60','61'], '60', 'Après cinquante-neuf vient soixante.'),
        choice('4 dizaines et 3 unités font…', ['34','43','40'], '43', 'Quatre dizaines font quarante, puis trois.')),
      level('Le sommet des cent', 'Au sommet, les dizaines forment une couronne.', 'Couronne des nombres',
        choice('Quel nombre vient après 99 ?', ['98','100','90'], '100', 'Après quatre-vingt-dix-neuf vient cent.'),
        order('Range ces nombres.', ['80','100','90'], ['80','90','100'], 'Quatre-vingts, quatre-vingt-dix, cent.'),
        choice('7 dizaines et 2 unités font…', ['27','72','70'], '72', 'Sept dizaines font soixante-dix, puis deux.'))
    ]
  },
  {
    id: 'village', name: 'Le Village des Mots', subtitle: 'Des histoires à inventer', guide: 'Pipa la souris', color: '#d37c75',
    levels: [
      level('Les enseignes perdues', 'Pipa a mélangé les enseignes des boutiques.', 'Enseigne peinte',
        match('Relie les mots aux objets.', [['sac','@sac'],['bol','@bol'],['lit','@lit']], 'Observe le dessin, puis lis.'),
        choice('Quel mot nomme le dessin ? @moto', ['moto','mouton','maison'], 'moto', 'Lis mo puis to.', 'moto'),
        match('Range deux autres étiquettes.', [['chat','@chat'],['lune','@lune']], 'Écoute les mots.')),
      level('Les syllabes de la boîte', 'Une lettre manque dans chaque boîte aux lettres.', 'Boîte aux lettres',
        choice('Complète : M_ pour écrire MA.', ['A','O','I'], 'A', 'M et A font MA.'),
        choice('Complète : L_ pour écrire LU.', ['A','U','E'], 'U', 'L et U font LU.'),
        match('Associe chaque syllabe.', [['MA','ma'],['LU','lu'],['SI','si']], 'Lis ensemble les deux lettres.')),
      level('L’atelier des mots', 'Pipa remet en ordre les lettres de ses cartes.', 'Carte de mot',
        order('Construis SAC.', ['C','S','A'], ['S','A','C'], 'S, A, C.'),
        order('Construis MOTO.', ['T','O','M','O'], ['M','O','T','O'], 'Mo puis to.'),
        order('Construis LUNE.', ['N','E','L','U'], ['L','U','N','E'], 'Lu puis ne.')),
      level('La bonne vitrine', 'La vitrine n’accepte qu’un mot bien écrit.', 'Vitrine brillante',
        choice('Choisis le mot bien écrit.', ['chat','chta','cath'], 'chat', 'CH, A, T : chat.'),
        choice('Choisis le mot bien écrit.', ['moto','mtoo','omto'], 'moto', 'MO puis TO.'),
        choice('Choisis le mot bien écrit.', ['lune','lnue','leun'], 'lune', 'LU puis NE.')),
      level('Les syllabes à écouter', 'Les cloches dictent des syllabes.', 'Clochette',
        choice('Écoute et choisis la syllabe.', ['ma','mo','mi'], 'ma', 'M avec A fait ma.', 'ma'),
        choice('Écoute et choisis la syllabe.', ['la','li','lu'], 'lu', 'L avec U fait lu.', 'lu'),
        order('Écris la syllabe entendue.', ['A','S'], ['S','A'], 'S puis A.', 'sa')),
      level('La dictée de Pipa', 'Pipa prononce les mots de son carnet.', 'Petit carnet',
        order('Écoute puis écris le mot.', ['C','A','S'], ['S','A','C'], 'S, A, C.', 'sac'),
        choice('Écoute puis choisis le mot.', ['bol','bal','bel'], 'bol', 'B, O, L : bol.', 'bol'),
        order('Écoute puis écris LUNE.', ['E','N','U','L'], ['L','U','N','E'], 'LU puis NE.', 'lune')),
      level('Les phrases mélangées', 'Les mots tombent des livres de la bibliothèque.', 'Livre rangé',
        order('Remets les mots en ordre.', ['dort.','Le','chat'], ['Le','chat','dort.'], 'Qui dort ? Le chat.'),
        order('Forme la phrase.', ['a','Nour','un sac.'], ['Nour','a','un sac.'], 'Commence par Nour.'),
        choice('Quel mot termine « La lune … » ?', ['brille.','mange.','nage.'], 'brille.', 'La lune brille.')),
      level('Le point et la majuscule', 'Pipa habille ses phrases pour les rendre lisibles.', 'Tampon de phrase',
        choice('Quelle phrase est bien écrite ?', ['Le chat dort.','le chat dort','Le chat dort'], 'Le chat dort.', 'Une phrase commence par une majuscule et finit par un point.'),
        choice('Que met-on au début d’une phrase ?', ['Une majuscule','Un point','Une virgule'], 'Une majuscule', 'La première lettre grandit.'),
        choice('Que met-on à la fin ?', ['Un point','Une majuscule','Un titre'], 'Un point', 'Le point ferme la phrase.')),
      level('La phrase à compléter', 'Des mots ont disparu du courrier du village.', 'Lettre du village',
        choice('Le chat ____ sur le lit.', ['dort','vole','lit'], 'dort', 'Le chat dort sur le lit.'),
        choice('Nour a un ____ rouge.', ['sac','lune','jour'], 'sac', 'Un sac peut être rouge.'),
        choice('La ____ brille la nuit.', ['lune','moto','table'], 'lune', 'La lune brille la nuit.')),
      level('La petite écrivaine', 'Pipa aide Nour à écrire sa première histoire.', 'Plume de village',
        order('Écris : « Nour voit un chat. »', ['chat.','voit','Nour','un'], ['Nour','voit','un','chat.'], 'Commence par Nour.'),
        order('Écris : « Le chat dort. »', ['dort.','chat','Le'], ['Le','chat','dort.'], 'Le, chat, dort.'),
        choice('Quel titre va avec ces deux phrases ?', ['Nour et le chat','La mer','Les nombres'], 'Nour et le chat', 'L’histoire parle de Nour et d’un chat.'))
    ]
  },
  {
    id: 'island', name: 'L’Île des Découvertes', subtitle: 'Observer le monde', guide: 'Tao la tortue', color: '#67b4b8',
    levels: [
      level('Le calendrier de la plage', 'Tao a perdu les jours de sa semaine.', 'Coquillage calendrier',
        order('Range les trois premiers jours.', ['mercredi','lundi','mardi'], ['lundi','mardi','mercredi'], 'Lundi, mardi, mercredi.'),
        choice('Quel jour vient après vendredi ?', ['samedi','jeudi','lundi'], 'samedi', 'Après vendredi vient samedi.'),
        match('Relie chaque jour à son voisin suivant.', [['lundi','mardi'],['mercredi','jeudi'],['samedi','dimanche']], 'Avance d’un jour.')),
      level('Les douze lunes', 'Chaque mois éclaire la grotte des calendriers.', 'Lune du calendrier',
        order('Range les premiers mois.', ['mars','janvier','février'], ['janvier','février','mars'], 'Janvier, février, mars.'),
        choice('Quel mois vient après juin ?', ['mai','juillet','août'], 'juillet', 'Après juin vient juillet.'),
        choice('Combien de mois dans une année ?', ['10','12','7'], '12', 'L’année compte douze mois.')),
      level('Le jardin des saisons', 'Le jardin change de couleur au fil de l’année.', 'Feuille des saisons',
        match('Relie chaque saison à son indice.', [['printemps','fleurs'],['été','soleil chaud'],['automne','feuilles qui tombent'],['hiver','neige']], 'Observe ce qui change dehors.'),
        choice('Quand les feuilles tombent-elles souvent ?', ['automne','été','printemps'], 'automne', 'Les feuilles tombent souvent en automne.'),
        order('Range le cycle à partir du printemps.', ['hiver','été','printemps','automne'], ['printemps','été','automne','hiver'], 'Printemps, été, automne, hiver.')),
      level('Les habitants de l’île', 'Tao cherche les animaux de chaque milieu.', 'Carnet des animaux',
        match('Associe les animaux à leur milieu.', [['poisson','eau'],['oiseau','air'],['lapin','terre']], 'Où les vois-tu vivre ?'),
        explore('Trouve les animaux cachés.', ['@chat','@fleur','@oiseau','@poisson','@arbre'], ['@chat','@oiseau','@poisson'], 'Les animaux sont le chat, l’oiseau et le poisson.'),
        choice('Quel animal a des plumes ?', ['oiseau','poisson','lapin'], 'oiseau', 'Les oiseaux ont des plumes.')),
      level('La serre des plantes', 'Les graines de Tao ont besoin de soins.', 'Graine de serre',
        order('Range la croissance de la plante.', ['fleur','graine','pousse'], ['graine','pousse','fleur'], 'La graine devient une pousse, puis une plante fleurit.'),
        choice('De quoi une plante a-t-elle besoin ?', ['eau','bonbons','jouets'], 'eau', 'Une plante a besoin d’eau.'),
        explore('Trouve les éléments du jardin.', ['@fleur','@arbre','@chat','@pomme','@ballon'], ['@fleur','@arbre'], 'La fleur et l’arbre sont des plantes.')),
      level('Le miroir de Nour', 'Un miroir magique aide à nommer le corps.', 'Miroir magique',
        match('Associe chaque partie à son action.', [['yeux','voir'],['oreilles','entendre'],['mains','toucher']], 'Les yeux voient ; les oreilles entendent.'),
        choice('Avec quoi marche-t-on ?', ['jambes','oreilles','cheveux'], 'jambes', 'Les jambes aident à marcher.'),
        choice('Combien de mains avons-nous habituellement ?', ['1','2','3'], '2', 'On a généralement deux mains.')),
      level('Les cinq sens', 'Une grotte révèle les sens de Nour.', 'Pierre des sens',
        match('Associe le sens à la partie du corps.', [['vue','yeux'],['ouïe','oreilles'],['odorat','nez'],['goût','langue'],['toucher','peau']], 'Chaque sens nous aide à découvrir le monde.'),
        choice('Avec quoi sent-on une fleur ?', ['nez','yeux','mains'], 'nez', 'Le nez aide à sentir.'),
        choice('Quel sens aide à écouter la mer ?', ['ouïe','goût','vue'], 'ouïe', 'L’ouïe sert à entendre.')),
      level('La carte au trésor', 'Tao lit les indications pour retrouver un coffre.', 'Petite boussole',
        choice('Le coffre est sous le pont. Où chercher ?', ['sous le pont','sur le pont','à côté du pont'], 'sous le pont', 'Sous signifie en dessous.'),
        match('Relie chaque mot à son contraire.', [['devant','derrière'],['dessus','dessous'],['gauche','droite']], 'Observe les positions opposées.'),
        order('Suis le chemin donné.', ['droite','avance','gauche'], ['avance','gauche','droite'], 'Avance, tourne à gauche, puis à droite.')),
      level('Avant et après', 'Les images du temps sont mélangées.', 'Sablier',
        order('Range une journée.', ['soir','matin','midi'], ['matin','midi','soir'], 'Le matin vient avant midi.'),
        choice('Que fait-on avant de dormir ?', ['se préparer pour la nuit','prendre le petit déjeuner','aller à l’école'], 'se préparer pour la nuit', 'On se prépare pour la nuit avant de dormir.'),
        order('Range ces moments.', ['aujourd’hui','demain','hier'], ['hier','aujourd’hui','demain'], 'Hier, aujourd’hui, demain.')),
      level('La grande exploration', 'Tao a préparé une chasse au trésor de l’île.', 'Médaille de l’île',
        explore('Trouve les deux êtres vivants.', ['@arbre','@cube','@oiseau','@ballon'], ['@arbre','@oiseau'], 'Un arbre et un oiseau sont vivants.'),
        choice('Quelle saison vient après l’été ?', ['automne','printemps','hiver'], 'automne', 'Après l’été vient l’automne.'),
        order('Range la pousse d’une fleur.', ['fleur','pousse','graine'], ['graine','pousse','fleur'], 'La graine vient avant la pousse.'))
    ]
  },
  {
    id: 'castle', name: 'Le Château des Défis', subtitle: 'Réfléchir et observer', guide: 'Éloi le dragon', color: '#9a81c2',
    levels: [
      level('La porte des formes', 'Éloi ouvre la porte aux bonnes formes.', 'Blason des formes',
        match('Associe chaque forme à son nom.', [['@cercle','cercle'],['@carre','carré'],['@triangle','triangle']], 'Observe les côtés et les coins.'),
        choice('Quelle forme a trois côtés ?', ['triangle','cercle','carré'], 'triangle', 'Compte ses trois côtés.'),
        explore('Trouve les formes rondes.', ['@cercle','@triangle','@ballon','@carre'], ['@cercle','@ballon'], 'Le cercle et le ballon sont ronds.')),
      level('L’escalier des suites', 'Les marches suivent un rythme secret.', 'Marche étoilée',
        choice('2, 4, 6, … Quel nombre suit ?', ['7','8','9'], '8', 'On ajoute deux à chaque fois.'),
        choice('rouge, bleu, rouge, bleu, …', ['rouge','bleu','vert'], 'rouge', 'Le rythme recommence.'),
        order('Continue la suite de 1 à 4.', ['4','2','1','3'], ['1','2','3','4'], 'Un, deux, trois, quatre.')),
      level('Les paires du coffre', 'Le coffre s’ouvre avec les bonnes associations.', 'Petite clé',
        match('Relie l’objet à son usage.', [['clé','ouvrir'],['livre','lire'],['crayon','dessiner']], 'À quoi sert chaque objet ?'),
        match('Relie l’animal à sa maison.', [['oiseau','nid'],['abeille','ruche'],['lapin','terrier']], 'Pense à l’endroit où il vit.'),
        choice('Quel objet va avec la pluie ?', ['parapluie','lunettes de soleil','seau de plage'], 'parapluie', 'Le parapluie protège de la pluie.')),
      level('La salle de mémoire', 'Éloi a caché des cartes jumelles.', 'Carte de mémoire',
        memory('Retourne les cartes et retrouve les paires.', [['@pomme','pomme'],['@chat','chat'],['@lune','lune']], 'Observe puis rappelle-toi où sont les cartes.'),
        memory('Trouve les nouvelles paires.', [['@sac','sac'],['@bol','bol']], 'Regarde bien chaque carte.'),
        match('Associe les images à leur nom.', [['@fleur','fleur'],['@arbre','arbre']], 'Utilise ce que tu as retenu.')),
      level('Les pièces du vitrail', 'Le vitrail révèle son dessin quand ses pièces sont rangées.', 'Éclat de vitrail',
        order('Range les pièces numérotées du vitrail.', ['3','1','4','2'], ['1','2','3','4'], 'Commence par la pièce 1.'),
        match('Associe les formes semblables.', [['@cercle','rond'],['@triangle','trois côtés'],['@carre','quatre côtés']], 'Observe chaque forme.'),
        choice('Quelle pièce termine 1, 2, 3, … ?', ['4','5','6'], '4', 'Après trois vient quatre.')),
      level('Le dragon des nombres', 'Éloi a besoin de petites opérations pour voler.', 'Écaille dorée',
        count('Compte les étoiles du dragon.', 'etoile', 6, [5,6,7], 'Compte chaque étoile.'),
        choice('4 + 2 = ?', ['5','6','7'], '6', 'Quatre et encore deux font six.'),
        choice('8 - 3 = ?', ['4','5','6'], '5', 'Retire trois à huit.')),
      level('La bibliothèque secrète', 'Les livres du château mélangent des mots connus.', 'Livre secret',
        order('Reconstruis le mot LUNE.', ['E','U','L','N'], ['L','U','N','E'], 'LU puis NE.'),
        choice('Qui dort dans « Le chat dort. » ?', ['Le chat','La lune','Nour'], 'Le chat', 'Lis le début de la phrase.'),
        match('Relie les mots à leurs dessins.', [['sac','@sac'],['bol','@bol']], 'Lis les mots à voix haute.')),
      level('Les détails cachés', 'Observe la salle et trouve les intrus.', 'Loupe du château',
        explore('Trouve les objets qui servent à lire ou écrire.', ['@livre','@crayon','@pomme','@ballon'], ['@livre','@crayon'], 'Un livre sert à lire ; un crayon sert à écrire.'),
        choice('Quel objet ne va pas avec les autres : chat, chien, pomme ?', ['pomme','chat','chien'], 'pomme', 'La pomme n’est pas un animal.'),
        explore('Trouve les objets du ciel.', ['@lune','@etoile','@lit','@bol'], ['@lune','@etoile'], 'La lune et les étoiles sont dans le ciel.')),
      level('Les trois portes', 'Chaque porte demande une compétence différente.', 'Clé des trois portes',
        choice('3 + 4 = ?', ['6','7','8'], '7', 'Trois et encore quatre font sept.'),
        order('Écris MOTO.', ['O','T','M','O'], ['M','O','T','O'], 'Mo puis to.'),
        choice('Quel sens sert à écouter ?', ['ouïe','vue','goût'], 'ouïe', 'On entend grâce à l’ouïe.')),
      level('Le grand défi de Nour', 'Nour et Éloi rassemblent leurs découvertes.', 'Couronne de l’aventure',
        memory('Retrouve les paires du château.', [['@lune','lune'],['@pomme','pomme'],['@chat','chat']], 'Prends ton temps et observe.'),
        choice('10 - 4 = ?', ['5','6','7'], '6', 'Dix moins quatre font six.'),
        order('Forme la phrase finale.', ['réussi !','a','Nour'], ['Nour','a','réussi !'], 'Commence par Nour.'))
    ]
  }
];

export const worlds: World[] = raw.map(world => ({
  ...world,
  levels: world.levels.map((entry, index) => ({
    ...entry,
    id: `${world.id}-${index + 1}`,
    activities: entry.activities.map((activity, activityIndex) => ({ ...activity, id: `${world.id}-${index + 1}-${activityIndex + 1}` }))
  }))
}));

export const worldById = (id: WorldId) => worlds.find(world => world.id === id)!;
export const levelById = (id: string) => worlds.flatMap(world => world.levels).find(level => level.id === id);
