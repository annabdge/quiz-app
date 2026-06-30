import React, { useState, useEffect, useMemo, useCallback } from "react";

/*
  Quiz di preparazione — Esame FSD (seconda prova)
  Banca dati 14_1 (React 1.24 aggiornato) + domande extra dai moduli in comune di 14_2.
  Active recall con feedback e spiegazioni. Progressi salvati con window.storage.
*/

const THEME = {
  bg: "#F4F6F9", surface: "#FFFFFF", ink: "#1A2230", sub: "#5C6677", line: "#E4E8EE",
  primary: "#2F4B7C", primarySoft: "#EAF0F9", amber: "#D8923B",
  good: "#1F8F5F", goodSoft: "#E6F5EE", bad: "#C8324C", badSoft: "#FBE9ED",
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

// correct = indice (0=A,1=B,2=C,3=D). why = spiegazione.
const MODULES = [
  {
    id: "1.01", name: "Inglese", questions: [
      { q: "The job was too difficult so he gave _____", o: ["up", "in", "on", "off"], correct: 0, why: "“Give up” = arrendersi/rinunciare." },
      { q: "If it hadn't rained the kids (to play) _____ on the beach", o: ["would play", "have played", "will play", "would have played"], correct: 3, why: "Terzo condizionale: if + past perfect → would have + participio." },
      { q: "What (to do) _____ at 10 o'clock last night?", o: ["Were you doing", "Have you done", "Will you do", "Are you doing"], correct: 0, why: "Past continuous: azione in corso in un momento preciso del passato." },
      { q: "The hovercraft was late and he (not arrive) _____ in Dover until 9.00.", o: ["wasn't arrived", "arrived", "didn't arrive", "wouldn't arrive"], correct: 2, why: "Past simple negativo: didn't arrive. “arrive” è intransitivo." },
      { q: "Hurry up! We _____ be at the airport at 7.00", o: ["may", "have to", "will", "would"], correct: 1, why: "“Have to” esprime obbligo/necessità." },
    ]
  },
  {
    id: "1.09", name: "Fondamenti di Informatica", questions: [
      { q: "Nell'architettura di Von Neumann, quale componente esegue operazioni aritmetiche e logiche?", o: ["ALU (Arithmetic Logic Unit)", "RAM", "Unità di Controllo (CU)", "Hard Disk"], correct: 0, why: "L'ALU fa i calcoli aritmetici e le operazioni logiche. La CU coordina, RAM/HD memorizzano." },
      { q: "Leggi di De Morgan: NOT (A AND B) equivale a…", o: ["(NOT A) AND (NOT B)", "(NOT A) OR (NOT B)", "A OR B", "NOT (A OR B)"], correct: 1, why: "De Morgan: la negazione di un AND diventa l'OR delle negazioni. L'AND si trasforma in OR." },
      { q: "Valore decimale del binario 1101?", o: ["11", "12", "13", "15"], correct: 2, why: "8+4+0+1 = 13." },
      { q: "Nei flowchart, quale forma rappresenta una condizione/selezione (bivio)?", o: ["Rettangolo", "Parallelogramma", "Rombo", "Ovale"], correct: 2, why: "Rombo = decisione. Rettangolo = elaborazione, Parallelogramma = I/O, Ovale = start/end." },
      { q: "In Algobuild/Flowgorithm, quale forma geometrica si usa per l'input dell'utente (operazione di lettura)?", o: ["Rettangolo (Assegnazione)", "Parallelogramma con freccia/Input", "Rombo (Selezione)", "Ovale (Start/End)"], correct: 1, why: "L'I/O si rappresenta col parallelogramma." },
      { q: "Ciclo con condizione verificata solo alla fine, con almeno un'esecuzione garantita:", o: ["while (pre-condizionato)", "do-while (post-condizionato)", "for", "sequenza pura"], correct: 1, why: "Il do-while controlla la condizione dopo il corpo, quindi esegue almeno una volta." },
      { q: "Conversione dell'esadecimale 'A' in decimale?", o: ["9", "10", "11", "16"], correct: 1, why: "In esadecimale A=10, B=11, …, F=15." },
      { q: "Cosa rappresenta formalmente un algoritmo nel contesto del pensiero computazionale?", o: ["Un programma in un linguaggio avanzato", "Una sequenza finita e non ambigua di passi per risolvere un problema", "Un componente hardware della CPU", "Un archivio dati in tabelle"], correct: 1, why: "Sequenza finita, ordinata e non ambigua di passi. Indipendente dal linguaggio." },
      { q: "Cosa si intende per “passaggio di parametri” quando si richiama una funzione o procedura in un software come Flowgorithm?", o: ["L'invio di valori dall'algoritmo principale alla funzione per essere elaborati", "La cancellazione delle variabili globali", "La stampa del risultato", "Il ritorno al blocco Start"], correct: 0, why: "I parametri sono i dati passati alla funzione perché li elabori." },
      { q: "Se un array (vettore) memorizzato in un algoritmo ha una dimensione pari a 5 elementi, qual è l'indice numerico del suo primoelemento?", o: ["0", "1", "-1", "5"], correct: 0, why: "Gli array sono zero-based: primo elemento indice 0, ultimo dimensione-1." },
      { q: "Qual è l'obiettivo principale di un algoritmo in programmazione?", o: ["Fornire un'interfaccia grafica intuitiva", "Descrivere una sequenza finita e ben definita di istruzioni per risolvere un problema", "Tradurre il codice sorgente in linguaggio macchina", "Gestire l'allocazione della memoria"], correct: 1, why: "L'algoritmo descrive i passi per risolvere un problema. Tradurre in linguaggio macchina è compito del compilatore." },
      { q: "In un linguaggio imperativo, a cosa serve una variabile?", o: ["A definire una funzione", "A memorizzare un valore che può cambiare durante l'esecuzione", "A controllare il flusso in base a una condizione", "A iterare su una collezione"], correct: 1, why: "Una variabile è un contenitore con nome per un valore modificabile a runtime." },
      { q: "Quale struttura di controllo ripete un blocco un numero predefinito di volte?", o: ["if-else", "while", "for", "chiamata di funzione"], correct: 2, why: "Il for è adatto quando il numero di iterazioni è noto. Il while ripete finché una condizione è vera." },
      { q: "Pseudocodice: numero=5; se numero>10 allora risultato=numero*2 altrimenti risultato=numero+3. Valore finale?", o: ["8", "10", "13", "Errore"], correct: 0, why: "5>10 è falso, quindi ramo “altrimenti”: risultato = 5+3 = 8." },
      { q: "Ruolo principale degli operatori logici (AND, OR, NOT)?", o: ["Eseguire operazioni matematiche", "Confrontare due valori per uguaglianza/differenza", "Combinare o invertire espressioni booleane (vere/false)", "Assegnare un valore a una variabile"], correct: 2, why: "AND/OR/NOT combinano o negano espressioni booleane. I confronti (==, <) sono operatori relazionali." },
    ]
  },
  {
    id: "1.10", name: "Programmazione (C)", questions: [
      { q: "QUale dei seguenti operatori viene utilizzato in C per ottenere l'indirizzo di memoria di una variabile?", o: ["&", "*", "->", "%"], correct: 0, why: "& è l'operatore “address-of”. * dereferenzia, -> accede a membri via puntatore, % è il modulo." },
      { q: "Qual è l'output del seguente frammento di codice: int a=5; int b=2; printf(\"%d\", a/b);", o: ["2", "2.5", "3", "Errore"], correct: 0, why: "Divisione tra interi: risultato troncato. 5/2 = 2." },
      { q: "Come si dichiara un array di 10 interi in C?", o: ["int arr[10];", "int arr(10);", "array int arr[10];", "int[10] arr;"], correct: 0, why: "Sintassi C: tipo nome[dimensione]." },
      { q: "Qual è l'header da includere per utilizzare le funzioni printf() e scanf()?", o: ["stdio.h", "stdlib.h", "conio.h", "string.h"], correct: 0, why: "stdio.h = standard I/O. stdlib.h per malloc/exit, string.h per le stringhe." },
      { q: "Quale ciclo garantisce almeno un'esecuzione del blocco?", o: ["do-while", "while", "for", "switch"], correct: 0, why: "do-while controlla la condizione in fondo." },
      { q: "In C, quale carattere segna implicitamente la fine di una stringa?", o: ["'\\0'", "'\\n'", "'.'", "' '"], correct: 0, why: "Il terminatore di stringa è il carattere nullo '\\0'. '\\n' è solo il fine riga." },
      { q: "Cosa succede se si tenta di accedere a un indice fuori dai limiti di un array (es. arr[12] su array di 10)?", o: ["Comportamento indefinito", "Errore di compilazione", "L'array si espande", "Restituisce sempre 0"], correct: 0, why: "In C non c'è bounds checking: è undefined behavior." },
    ]
  },
  {
    id: "1.11", name: "OOP: Introduzione", questions: [
      { q: "Concetto OOP che modella oggetti del mondo reale come entità software con proprietà e comportamenti:", o: ["Polimorfismo", "Ereditarietà", "Astrazione", "Incapsulamento"], correct: 2, why: "L'astrazione rappresenta entità reali tenendone solo proprietà essenziali e comportamenti." },
      { q: "Principio OOP per cui una classe acquisisce proprietà e comportamenti di un'altra classe:", o: ["Incapsulamento", "Polimorfismo", "Ereditarietà", "Astrazione"], correct: 2, why: "L'ereditarietà permette di riusare/estendere la classe base." },
      { q: "Cos'è il polimorfismo nella programmazione a oggetti?", o: ["Nascondere i dati interni", "La capacità di un oggetto di assumere molte forme in base al contesto o al tipo di riferimento", "Creare una classe da una esistente", "Definire proprietà e comportamenti"], correct: 1, why: "Poli-morfismo = “molte forme”: stesso metodo, comportamento diverso secondo il tipo effettivo." },
      { q: "Vantaggio principale dell'incapsulamento?", o: ["Riuso tramite ereditarietà", "Trattare oggetti diversi in modo uniforme", "Migliora sicurezza e manutenibilità nascondendo i dettagli interni", "Semplifica concetti complessi"], correct: 2, why: "Nascondere l'implementazione protegge lo stato e permette di cambiarlo dentro senza rompere chi usa la classe." },
      { q: "Cosa rappresenta un “oggetto”?", o: ["Un modello/progetto per creare altri oggetti", "Un tipo di dato primitivo", "Un'istanza concreta di una classe, con il proprio stato", "Una funzione che opera su dati"], correct: 2, why: "L'oggetto è l'istanza concreta in memoria; il modello è invece la classe." },
      { q: "Come si definisce un costruttore di una classe?", o: ["Con lo stesso nome della classe e nessun tipo di ritorno", "Usando la keyword constructor", "Con il tipo di ritorno void", "Solo con la keyword new"], correct: 0, why: "Il costruttore ha lo stesso nome della classe e non ha tipo di ritorno (nemmeno void). Viene chiamato alla creazione dell'oggetto." },
      { q: "Cosa succede accedendo a un membro private dall'esterno della classe?", o: ["Il programma viene eseguito normalmente", "Genera un warning", "Genera un errore di compilazione", "Va in crash a runtime"], correct: 2, why: "Un membro private non è accessibile fuori dalla classe: il compilatore segnala un errore (non un warning, non un crash a runtime)." },
    ]
  },
  {
    id: "1.12", name: "OOP: Applicazioni (.NET/C#)", questions: [
      { q: "Componente .NET responsabile dell'esecuzione del codice e del Garbage Collection:", o: ["CLR (Common Language Runtime)", "SDK", "JIT (Just-In-Time)", "MSIL"], correct: 0, why: "Il CLR esegue il codice gestito e gestisce la memoria (GC). Il JIT è una sua parte, MSIL è il bytecode, l'SDK il kit di sviluppo." },
      { q: "Parola chiave C# per una costante stabilita a tempo di compilazione e immutabile:", o: ["readonly", "const", "static", "final"], correct: 1, why: "const = valore fissato in compilazione. readonly si assegna a runtime nel costruttore. “final” non esiste in C#." },
      { q: "Differenza principale Classe vs Oggetto:", o: ["La classe è l'istanza in RAM, l'oggetto è il sorgente", "La classe gestisce metodi privati, l'oggetto proprietà pubbliche", "La classe è il modello/blueprint, l'oggetto è l'istanza concreta", "Nessuna differenza"], correct: 2, why: "Classe = stampo astratto; oggetto = istanza concreta creata da quello stampo." },
      { q: "Modificatore C# che rende un membro visibile solo nella stessa classe e nelle derivate:", o: ["private", "internal", "protected", "public"], correct: 2, why: "protected = classe + sottoclassi. private solo nella classe, internal nell'assembly, public ovunque." },
      { q: "Cos'è l'Overloading (sovraccarico) dei metodi?", o: ["Riscrivere un metodo nella derivata (override)", "Più metodi con lo stesso nome ma firma diversa (numero/tipo di parametri)", "Raddoppiare la memoria di un metodo statico", "Cambiare il tipo di ritorno senza toccare i parametri"], correct: 1, why: "Overloading = stesso nome, firme diverse (compile-time). Diverso dall'overriding (run-time)." },
      { q: "Pilastro OOP: nascondere lo stato interno e dare accesso solo via metodi/proprietà pubbliche:", o: ["Incapsulamento", "Ereditarietà", "Polimorfismo", "Astrazione"], correct: 0, why: "È la definizione di incapsulamento: stato nascosto, accesso controllato." },
      { q: "Concetto per cui un oggetto derivato è trattato come la classe base, eseguendo il metodo giusto a runtime:", o: ["Incapsulamento", "Overloading", "Polimorfismo", "Modificatori di accesso"], correct: 2, why: "È il polimorfismo (override risolto a runtime): il tipo reale determina quale metodo gira." },
      { q: "Limitazione corretta delle Classi Astratte vs Interfacce in C#:", o: ["Una classe astratta non può avere metodi implementati", "Una classe eredita da una sola classe base (anche astratta), ma può implementare molteplici interfacce", "Le classi astratte non supportano modificatori d'accesso", "Le classi astratte non sono ereditabili"], correct: 1, why: "C# ha ereditarietà singola di classe, ma implementazione multipla di interfacce. Le classi astratte POSSONO avere metodi implementati." },
      { q: "Nelle Property C#, a cosa serve tipicamente il blocco speciale 'set'?", o: ["Leggere e restituire il valore del campo privato", "Assegnare un nuovo valore al campo privato, eventualmente validandolo", "Distruggere l'istanza dalla memoria", "Inizializzare un HashSet"], correct: 1, why: "set scrive il valore (spesso validandolo). get legge." },
      { q: "Parola chiave da mettere su un metodo base per poterlo sovrascrivere (override) nella derivata:", o: ["static", "abstract", "virtual", "new"], correct: 2, why: "virtual abilita l'override. abstract obbliga la derivata a implementarlo (senza corpo)." },
      { q: "Quale tra questi NON può essere ereditato da una classe derivata in C#?", o: ["Costruttori", "Metodi pubblici", "Proprietà protette", "Eventi"], correct: 0, why: "I costruttori non si ereditano: la derivata definisce i propri e può richiamare quello base con : base(...). Metodi, proprietà ed eventi sì." },
      { q: "Come si accede al valore di un campo statico di una classe?", o: ["Tramite un'istanza della classe", "Solo dal costruttore", "Usando il nome della classe", "Usando il modificatore ref"], correct: 2, why: "I membri statici appartengono alla classe, non all'istanza: si accedono con NomeClasse.Membro." },
    ]
  },
  {
    id: "1.13", name: "Ingegneria del Software", questions: [
      { q: "Nel modello a cascata, fase immediatamente PRIMA della codifica:", o: ["Analisi dei requisiti", "Manutenzione", "Installazione", "Test di sistema"], correct: 0, why: "Cascata: Requisiti → Progettazione → Codifica → Test → Manutenzione." },
      { q: "Primo test nel ciclo a V di testing:", o: ["Test di sistema", "Test di integrazione", "Test unitario", "Test di accettazione"], correct: 2, why: "Si parte dal basso: unit → integrazione → sistema → accettazione." },
      { q: "Quale NON è una caratteristica del versioning semantico (SemVer)?", o: ["Major per modifiche non retrocompatibili", "Minor per nuove funzionalità retrocompatibili", "Patch per bugfix retrocompatibili", "Beta per miglioramenti estetici"], correct: 3, why: "SemVer è MAJOR.MINOR.PATCH. La regola “beta per estetica” è inventata." },
      { q: "In un diagramma UML use case, cosa rappresenta la relazione “include”?", o: ["Un attore esterno", "Una generalizzazione tra attori", "Una funzionalità comune riutilizzata da più casi d'uso", "Un evento d'errore"], correct: 2, why: "«include» fattorizza un comportamento comune richiamato da altri casi d'uso." },
      { q: "In Scrum, chi rimuove gli impedimenti e tutela la produttività del team?", o: ["Product Owner", "Utente finale", "ScrumMaster", "Team Leader"], correct: 2, why: "Lo ScrumMaster facilita e toglie gli ostacoli. Il PO gestisce il backlog." },
    ]
  },
  {
    id: "1.14", name: "Basi di Dati", questions: [
      { q: "Durante la progettazione logica del database, come si risolve correttamente una relazione Molti-a-Molti (N:M) tra due entità (ad esempio 'Autori' e 'Libri')?", o: ["FK di Autori dentro Libri", "Si crea una nuova tabella ponte con le PK di entrambe le entità", "Più ID separati da virgola in un campo", "Non è gestibile, serve Excel"], correct: 1, why: "Il molti-a-molti si scioglie con una tabella associativa (ponte), diventando due relazioni 1:N." },
      { q: "Differenza tra INNER JOIN e LEFT JOIN (A sinistra, B destra)?", o: ["INNER restituisce tutto, LEFT solo i comuni", "Sono sinonimi", "INNER solo le righe con match in entrambe; LEFT tutte le righe di A, anche se non hanno corrispondenza in B", "LEFT serve solo per unire più di due tabelle"], correct: 2, why: "INNER = intersezione. LEFT = tutte le righe di A + corrispondenti di B (NULL dove manca)." },
      { q: "Vantaggio del JSON rispetto al CSV per dati complessi?", o: ["Il JSON Supporta nativamente strutture gerarchiche (dati annidati, array, oggetti) che il CSV non può rappresentare facilmente", "È leggibile solo dalle macchine", "Occupa sempre meno spazio (è binario)", "Non richiede virgolette per le stringhe"], correct: 0, why: "Il CSV è piatto; il JSON rappresenta dati annidati/gerarchici. Il JSON è testuale, non binario." },
      { q: "Importando un CSV in MariaDB vedi “cittÃ ” invece di “città”. Causa più probabile?", o: ["Problema di Encoding (es. file UTF-8 vs database Windows-1252)", "Separatore sbagliato", "Spazio su disco esaurito", "Il CSV non supporta il testo"], correct: 0, why: "“cittÃ ” è mojibake da mismatch di codifica caratteri (UTF-8 letto come Latin-1)." },
      { q: "Cosa consente una licenza CC-BY (Creative Commons Attribution)?", o: ["Solo uso personale, no commerciale", "Riutilizzare, modificare e distribuire (anche commercialmente) citando la fonte", "Pubblico dominio senza obblighi", "Vieta opere derivate"], correct: 1, why: "CC-BY: tutto permesso (anche commerciale e derivate) purché si attribuisca l'autore." },
    ]
  },
  {
    id: "1.15", name: "Sistemi, SO, Cloud", questions: [
      { q: "Cos'è il file unattended.xml?", o: ["Raccoglie informazioni utili all'installazione del S.O.", "File di risposte XML per automatizzare l'installazione di Windows", "Fornisce opzioni come lingua, fuso orario, configurazione prodotto", "Tutte le risposte sono corrette"], correct: 3, why: "È il “answer file”: A, B e C sono tutte vere." },
      { q: "Con quale frequenza vanno aggiornate le macchine virtuali?", o: ["Mai", "Ogni volta che Windows Update lo richiede", "Si può sospendere per un periodo, ma è sconsigliato in produzione", "B e C sono entrambe corrette"], correct: 3, why: "Sia B sia C sono valide." },
      { q: "Cos'è la netmask?", o: ["Successione contigua di bit a 1 da sinistra, identifica il network ID", "Successione di bit a 0 che identifica l'host", "Tre ottetti che identificano gli host", "Bit alternati 0 e 1"], correct: 0, why: "Sequenza di 1 contigui da sinistra che separa la parte di rete dalla parte host." },
      { q: "Quale affermazione è corretta parlando di switch e router?", o: ["Connettono host tra loro", "Lavorano su livelli diversi della pila ISO-OSI", "Lo switch collega host nella stessa rete, il router collega reti diverse", "Tutte le affermazioni sono corrette"], correct: 3, why: "A, B e C sono tutte vere (switch a livello 2, router a livello 3)." },
      { q: "Quale delle seguenti affermazioni, relative all’utilizzo della virtualizzazione, NON è corretta?", o: ["Più VM sullo stesso server sfruttano al massimo la potenza computazionale", "I Sistemi operativi delle VM non necessitano più di aggiornamenti e patch di sicurezza", "Una VM si archivia e ripristina facilmente", "Le VM eseguono applicativi legacy su Hardware/SO obsoleti"], correct: 1, why: "Falsa: anche le VM hanno SO che richiedono patch e aggiornamenti." },
      { q: "Differenza tra Microsoft Hyper-V e Multipass della Canonical:", o: ["Multipass è un software simile a Oracle VirtualBox, Hyper-V è un'altra cosa", "Multipass lavora solo in ambiente Linux, Hyper-V solo Windows", "Hyper-V è un software native hypervisor su Windows, Multipass una CLI cross-platform che simula un cloud di macchine virtuali Ubuntu", "Hyper-V è un software native hypervisor in ambiente Windows, Multipass è un software native hypervisor in ambiente Linux"], correct: 2, why: "Hyper-V = hypervisor tipo 1 su Windows; Multipass = CLI multipiattaforma per VM Ubuntu." },
      { q: "Cos'è un processo nei sistemi operativi?", o: ["Un blocco di codice eseguibile indipendentemente", "Un'istanza in esecuzione di un programma eseguibile", "Equivale sempre a un thread", "Un programma non compilato"], correct: 1, why: "Il processo è un programma in esecuzione, con proprio spazio di memoria e risorse." },
      { q: "Differenza principale tra processo e thread:", o: ["Il processo condivide sempre la memoria con altri processi, il thread no", "Il thread è un'istanza indipendente del sistema operativo, il processo no", "Il processo ha spazio di memoria separato, mentre i thread condividono lo stesso spazio di memoria all'interno del processo", "I thread non possono essere eseguiti in parallelo, i processi sì"], correct: 2, why: "Ogni processo ha memoria isolata; i thread di uno stesso processo condividono il suo spazio." },
      { q: "A cosa serve il comando linux \"sudo passwd root\"? [domanda difettosa]", o: ["Backup automatico su cloud", "Trasformare software in hardware", "Gestire le risorse e fare da intermediario utente-hardware", "Installare automaticamente le applicazioni"], correct: 2, why: " 'sudo passwd root' in realtà imposta/cambia la password di root. Nessuna opzione è corretta — la C è la definizione di “sistema operativo”, probabilmente l'opzione attesa, ma è un errore della banca dati." },
    ]
  },
  {
    id: "1.16", name: "Internet, Cloud, IoT", questions: [
      { q: "La struttura dello stack protocollare nel modello TCP/IP prevede i seguenti livelli (ordinati dall’alto verso il basso):", o: ["Applicativo–Rete–Trasporto–Fisico–Linea", "Applicativo–Trasporto–Rete–Linea–Fisico", "Fisico–Linea–Trasporto–Rete–Applicativo", "Linea–Trasporto–Rete–Applicativo–Fisico"], correct: 1, why: "Dall'alto: Applicazione → Trasporto → Rete → Linea → Fisico." },
      { q: "Il ritardo di coda di un pacchetto:", o: ["Dipende solo dalle code nei router di core", "È legato al traffico in rete e alla dimensione delle code", "Dipende solo dalla distanza fisica", "Dipende solo dalla lunghezza del pacchetto"], correct: 1, why: "Il queuing delay dipende dalla congestione: più traffico/code, più attesa." },
      { q: "Quale affermazione sul routing è FALSA?", o: ["Decide il percorso che i pacchetti devono percorrere dalla sorgente alladestinazione", "È un'alternativa al forwarding", "Compila le tabelle di forwarding con algoritmi di routing", "Può essere statico o dinamico"], correct: 1, why: "Falsa: routing e forwarding sono complementari, non alternativi (control plane vs data plane)." },
      { q: "Il protocollo TCP:", o: ["È un protocollo di rete con controllo di congestione", "È un protocollo di trasporto orientato alla connessione", "È leggero e veloce, ideale per il real-time", "È un protocollo di accesso multiplo"], correct: 1, why: "TCP è di TRASPORTO e connection-oriented. “Leggero per real-time” descrive UDP." },
      { q: "Gli indirizzi IPv4 sono formati da:", o: ["32 bit, 4 blocchi da 8 bit", "48 bit, 6 blocchi esadecimali", "64 bit, 8 blocchi da 1 byte", "128 bit, 6 blocchi esadecimali"], correct: 0, why: "IPv4 = 32 bit, 4 ottetti. I 128 bit sono dell'IPv6." },
    ]
  },
  {
    id: "1.17", name: "Reti Wireless e Mobile", questions: [
      { q: "Tecnologia usata per le reti Wi-Fi domestiche:", o: ["LTE", "IEEE 802.11", "ZigBee", "NFC"], correct: 1, why: "Il Wi-Fi è lo standard IEEE 802.11. LTE è cellulare, ZigBee/NFC per IoT/prossimità." },
      { q: "Trasmettitore 20 dBm, perdita di spazio libero 80 dB. Potenza ricevuta?", o: ["-60 dBm", "60 dBm", "-100 dBm", "-80 dBm"], correct: 0, why: "In dB si sottrae: 20 − 80 = −60 dBm." },
      { q: "Cosa indica “handover” nelle reti mobili?", o: ["Passaggio automatico da una cella all'altra", "Aumento della potenza del segnale", "Cambio di tecnologia (4G→Wi-Fi)", "Cifratura dei dati"], correct: 0, why: "L'handover trasferisce una connessione attiva da una cella a un'altra senza interruzione." },
      { q: "Se la frequenza di un segnale raddoppia, il periodo:", o: ["Raddoppia", "Rimane invariato", "Si dimezza", "Diventa nullo"], correct: 2, why: "T = 1/f: se f raddoppia, T si dimezza." },
      { q: "In un canale AWGN, la capacità al variare della banda:", o: ["Aumenta sempre linearmente con la banda", "Aumenta con la banda, ma dipende anche dal SNR", "È indipendente dalla banda", "Diminuisce all'aumentare della banda"], correct: 1, why: "Shannon: C = B·log₂(1+SNR). Cresce con B ma dipende dal rapporto segnale/rumore." },
    ]
  },
  {
    id: "1.18", name: "Cybersecurity", questions: [
      { q: "In relazione all’uso delle funzioni di hash per il controllo dell’integrità e per le firme elettroniche, quale affermazione è corretta?", o: ["Individuano con certezza matematica qualsiasi modifica", "Associano a ogni messaggio un sunto sicuramente unico e irripetibile", "Rendono computazionalmente difficile costruire due messaggi diversi con lo stesso digest", "Nessuna delle precedenti"], correct: 2, why: "La proprietà reale è la resistenza alle collisioni: non “impossibile”, ma computazionalmente proibitivo. A e B sono troppo assolute." },
      { q: "Per elaborare una strategia di sicurezza è necessario:", o: ["Monitorare l'uso della rete", "Integrare le esigenze di sicurezza con attività e processi produttivi dell'azienda", "Rendere i dipendenti consapevoli di regole ed etica", "Nessuna delle precedenti"], correct: 1, why: "La sicurezza va calata nei processi di business: deve abilitare l'azienda, non ostacolarla." },
      { q: "Un attacco attivo:", o: ["È meno complesso da rilevare di uno passivo", "Si basa sulla duplicazione del traffico di utenti autorizzati", "La segmentazione della rete è utile a prevenirlo", "Tutte le precedenti sono corrette"], correct: 3, why: "Tutte e tre reggono: un attacco attivo modifica/genera traffico (più rilevabile) e la segmentazione aiuta a contenerlo." },
      { q: "Dispositivo compromesso in una rete senza segmentazione: conseguenza più probabile?", o: ["L'attacco resta limitato al dispositivo violato", "L'attaccante può muoversi e accedere a tutta la rete", "Il dispositivo viene disconnesso automaticamente", "Router/firewall bloccano subito l'attaccante"], correct: 1, why: "Senza segmentazione non ci sono barriere interne: lateral movement libero per tutta la rete." },
      { q: "Gli IP 10.185.120.234, 10.185.122.41 e 10.185.123.235 possono stare nella stessa rete?", o: ["Sì, in ogni caso", "Sì, se netmask 255.255.255.128", "Sì, se netmask 255.255.255.0", "Sì, se netmask 255.255.252.0"], correct: 3, why: "Con /22 (255.255.252.0) il terzo ottetto si raggruppa a blocchi di 4: 120,122,123 cadono nel blocco 120–123 → stessa rete. Con /24 servirebbe il terzo ottetto identico." },
      { q: "Quale misura NON è migliorata direttamente dalla segmentazione della rete?", o: ["Protezione contro gli attacchi di ingegneria sociale", "Capacità di osservare traffico malevolo", "Individuazione di intrusioni", "Rapidità nel contenere un attacco"], correct: 0, why: "L'ingegneria sociale colpisce le persone, non la topologia: la segmentazione non la previene." },
    ]
  },
  {
    id: "1.19", name: ".NET / C#", questions: [
      { q: "Quale sistema operativo è supportato da .NET?", o: ["Solo Windows", "Solo Linux", "Solo MacOS", "Tutti i precedenti e anche altri"], correct: 3, why: ".NET (Core/5+) è cross-platform: Windows, Linux, macOS e altri." },
      { q: "Descrizione corretta della differenza tra oggetto e classe:", o: ["Nessuna differenza", "Una classe è la definizione di un oggetto, un oggetto è un'istanza della classe", "Un oggetto è la definizione di una classe", "L'oggetto è value-type, la classe reference-type"], correct: 1, why: "La classe definisce; l'oggetto è un'istanza concreta creata da quella definizione." },
      { q: "In LINQ, cosa restituisce: orders.Where(o => o.Date.Year == 2024);", o: ["Ordini con data successiva al 2024", "Gli ordini dell'anno 2024", "Ordina per anno", "Raggruppa per anno"], correct: 1, why: "Where filtra: tiene solo gli ordini con anno 2024. (OrderBy ordina, GroupBy raggruppa.)" },
    ]
  },
  {
    id: "1.20", name: "Spring Boot", questions: [
      { q: "Cos'è Spring Boot e quale problema risolve rispetto a Spring tradizionale?", o: ["Aggiunge librerie al linguaggio Java", "Permette app senza server", "Semplifica la configurazione e velocizza lo sviluppo con Spring", "È un sostituto di Java"], correct: 2, why: "Spring Boot riduce la configurazione manuale (auto-config, starter, server embedded)." },
      { q: "Vantaggi principali di Spring Boot:", o: ["Nessuna configurazione e nessun file di progetto", "Avvio rapido, configurazioni automatiche, server integrato, gestione dipendenze facile", "Funziona solo con MySQL", "Serve solo per pagine web statiche"], correct: 1, why: "Auto-config, server embedded (Tomcat), starter, avvio veloce." },
      { q: "Come si avvia un'applicazione Spring Boot?", o: ["Con un .exe generato dal framework", "Con il metodo main che usa SpringApplication.run(...) o avviando il JAR", "Solo tramite server esterno", "Dal browser scrivendo l'URL"], correct: 1, why: "Punto d'ingresso: main con SpringApplication.run(); si distribuisce come JAR eseguibile." },
      { q: "A cosa serve application.properties / application.yml?", o: ["Scrivere il codice sorgente", "Memorizzare immagini e risorse statiche", "Configurare parametri (porta, database, log, credenziali)", "Installare plugin"], correct: 2, why: "È la configurazione esterna dell'app: porta, datasource, logging, profili." },
      { q: "Differenza tra @RestController e @Service in Spring Boot?", o: ["@RestController gestisce richieste HTTP, @Service contiene la logica di business", "@RestController configura database, @Service invia email", "Fanno la stessa cosa", "@Service restituisce viste HTML, @RestController JSON"], correct: 0, why: "@RestController è il layer web; @Service è la business logic." },
    ]
  },
  {
    id: "1.21", name: "DevOps, Git, Agile", questions: [
      { q: "A cosa serve git status?", o: ["Visualizzare il contenuto di un file", "Controllare la cronologia dei commit", "Verificare lo stato di working directory e staging area", "Cancellare un branch"], correct: 2, why: "git status mostra cosa è modificato, in staging e untracked. La cronologia è git log." },
      { q: "Cos'è un branch in Git?", o: ["Un backup del repository", "Un file di configurazione", "Una linea di sviluppo indipendente per nuove funzionalità", "Un commit cancellato"], correct: 2, why: "Un branch è un puntatore a una linea di sviluppo: isolamento e poi merge." },
      { q: "Differenza tra git pull e git fetch?", o: ["Nessuna, sono sinonimi", "git pull aggiorna il codice locale e lo unisce", "git fetch elimina i file temporanei", "git pull crea un nuovo branch"], correct: 1, why: "fetch scarica senza toccare il locale; pull = fetch + merge." },
      { q: "In un .gitignore, cosa accade ai file elencati?", o: ["Vengono cancellati dal repository", "Vengono evidenziati in rosso", "Vengono ignorati da Git e non tracciati", "Vengono archiviati in remoto"], correct: 2, why: ".gitignore esclude i file dal tracciamento (build, segreti, dipendenze)." },
      { q: "Chi è il Product Owner in Scrum?", o: ["Chi scrive il codice", "Chi guida il team di sviluppo", "Chi rappresenta il cliente e definisce le priorità", "Chi testa il software"], correct: 2, why: "Il PO è la voce del cliente: gestisce e prioritizza il Product Backlog." },
      { q: "Cosa fa il comando touch in Linux/macOS?", o: ["Visualizza data e ora", "Crea un nuovo file vuoto", "Elimina file", "Rinomina file"], correct: 1, why: "touch crea un file vuoto (o aggiorna il timestamp). Rinominare = mv." },
      { q: "Cosa fa git log?", o: ["Salva le modifiche su GitHub", "Visualizza l'elenco dei branch", "Mostra la cronologia dei commit", "Ritorna a uno stato precedente"], correct: 2, why: "git log elenca i commit (autore, data, messaggio, hash)." },
      { q: "Ruolo dello Scrum Master?", o: ["Codificare e testare", "Imporre regole al team", "Facilitare il processo e rimuovere impedimenti", "Vendere il prodotto"], correct: 2, why: "Servant leader: facilita Scrum e toglie gli ostacoli. Non comanda." },
      { q: "Cosa succede con git merge se ci sono conflitti?", o: ["Git fa il merge automatico", "Git ti chiede di risolvere la versione", "Git cancella le modifiche", "Il branch viene chiuso"], correct: 1, why: "In conflitto Git marca le zone e lascia a te la risoluzione manuale." },
      { q: "Scopo principale di un README in un repository GitHub?", o: ["Aggiungere codice di esempio", "Spiegare scopo, uso e istruzioni del progetto", "Nascondere file sensibili", "Inserire i dati dell'utente"], correct: 1, why: "Il README è la documentazione d'ingresso: cos'è e come si usa." },
    ]
  },
  {
    id: "1.22", name: "Web: HTML/CSS/JS", questions: [
      { q: "Quale attributo HTML rende un <input> obbligatorio?", o: ["needed", "required", "mandatory", "force"], correct: 1, why: "required impedisce l'invio del form se il campo è vuoto." },
      { q: "Quale tag HTML definisce la sezione principale del contenuto della pagina? [ambigua]", o: ["<main>", "<section>", "<body>", "<article>"], correct: 0, why: "Il tag semantico del contenuto principale è <main>. Nota: <body> contiene TUTTO il contenuto — se la banca dati segna <body>, lo intende come “corpo pagina”, ma il tag specifico è <main>." },
      { q: "Quale proprietà CSS controlla lo spazio interno di un elemento?", o: ["margin", "padding", "border", "outline"], correct: 1, why: "padding = spazio interno; margin = spazio esterno." },
      { q: "Quale metodo JavaScript converte una stringa in un intero?", o: ["toInt()", "parseInt()", "number()", "int()"], correct: 1, why: "parseInt(\"42\") → 42. Number() esiste (N maiuscola); toInt/int non esistono." },
      { q: "Quale istruzione JavaScript permette di scrivere un messaggio nella console del browser?", o: ["console.write()", "console.log()", "log.console()", "alertConsole()"], correct: 1, why: "console.log() è il metodo standard. console.write non esiste in JS." },
    ]
  },
  {
    id: "1.23", name: "Python web", questions: [
      { q: "Cosa significa 'scope' di una variabile?", o: ["Il suo tipo", "Il suo valore", "Dove è accessibile nel codice", "Quanto spazio occupa"], correct: 2, why: "Lo scope è l'ambito di visibilità: dove la variabile esiste ed è raggiungibile." },
      { q: "Cosa produce 5 % 2?", o: ["2.5", "2", "1", "0"], correct: 2, why: "% è il modulo: 5 diviso 2 dà resto 1." },
      { q: "Quale file contiene le dipendenze Python?", o: ["package.json", "requirements.txt", "dependencies.txt", "Pipfile"], correct: 1, why: "requirements.txt è lo standard (pip install -r). package.json è di Node.js." },
      { q: "In un'API REST con Django, flusso corretto per una GET:", o: ["Client → URL → View → Model → Serializer → JSON Response", "Client → Serializer → Model → View → Response", "Client → Model → URL → View → JSON Response", "Client → View → Serializer → URL → Response"], correct: 0, why: "URL router → View → Model → Serializer (in JSON) → risposta al client." },
      { q: "Cosa fa python manage.py migrate?", o: ["Crea il file delle migrazioni", "Applica le migrazioni al database", "Rimuove le migrazioni vecchie", "Esporta il database"], correct: 1, why: "migrate applica le migrazioni allo schema. Crearle = makemigrations." },
    ]
  },
  {
    id: "1.24", name: "React 1: i componenti", questions: [
      { q: "Come si chiama il sistema di aggiornamento del DOM usato da React?", o: ["Shadow DOM", "Real DOM", "Virtual DOM", "React DOM"], correct: 2, why: "React usa il Virtual DOM: una copia in memoria, confrontata (diffing) per aggiornare solo ciò che cambia nel DOM reale." },
      { q: "Quale comando crea un nuovo progetto React con Vite?", o: ["npx create-vite-latest", "npm create vite@latest", "npx create vite latest app", "npm init vite app"], correct: 1, why: "Il comando ufficiale è 'npm create vite@latest' (poi si sceglie il template React)." },
      { q: "Quale hook permette di gestire lo stato nei functional component?", o: ["useContext", "useEffect", "useState", "useReducer"], correct: 2, why: "useState aggiunge stato locale, restituendo [valore, funzioneDiAggiornamento]." },
      { q: "Come si scrive JSX?", o: ["È una sintassi simile a XML dentro JavaScript", "È un formato JSON", "È un linguaggio separato dal JS", "È un file CSS"], correct: 0, why: "JSX è una sintassi simile a XML/HTML dentro JavaScript, poi traspilata in React.createElement." },
      { q: "Qual è un vantaggio di React rispetto al semplice uso di HTML, CSS e JS?", o: ["Non richiede JavaScript", "Aggiornamenti più efficienti con Virtual DOM", "Non necessita di server", "Funziona solo lato backend"], correct: 1, why: "Grazie al Virtual DOM, React applica aggiornamenti mirati ed efficienti al DOM reale." },
      { q: "Un'app realizzata solo con HTML, CSS e JS tende a:", o: ["Essere più strutturata", "Avere meno manutenzione", "Scalare meglio", "Gestire peggio componenti complessi"], correct: 3, why: "Senza un framework a componenti, le app vanilla gestiscono peggio la complessità crescente." },
      { q: "Quale concetto centrale è introdotto da React rispetto a HTML/CSS/JS classici?", o: ["Componenti riutilizzabili", "Più tag HTML", "Nuovi selettori CSS", "Eliminazione di JavaScript"], correct: 0, why: "L'idea portante di React è comporre l'UI con componenti isolati e riutilizzabili." },
      { q: "Differenza tra manipolare il DOM direttamente con JS e farlo con React?", o: ["Nessuna differenza", "React è più lento", "React usa Virtual DOM per ottimizzare gli aggiornamenti", "JS non può manipolare il DOM"], correct: 2, why: "Manipolare il DOM a mano è costoso e prono a errori; React usa il Virtual DOM per minimizzare gli aggiornamenti reali." },
      { q: "Quale approccio è più adatto a grandi applicazioni scalabili?", o: ["HTML, CSS e JS classici", "React", "Solo CSS", "Solo HTML"], correct: 1, why: "La componentizzazione e il flusso dati prevedibile rendono React adatto ad app grandi e team numerosi." },
      { q: "Come si dichiara un class component in React?", o: ["class MyComponent extends React.Component {}", "function MyComponent() {}", "React.Class(MyComponent)", "new Component(MyComponent)"], correct: 0, why: "Un class component estende React.Component: 'class MyComponent extends React.Component {}'." },
    ]
  },
  {
    id: "1.25", name: "React 2", questions: [
      { q: "In React, qual è il ruolo del Virtual DOM?", o: ["Sostituisce completamente il DOM reale", "Migliora la sicurezza", "Calcola il minimo numero di modifiche da applicare al DOM reale", "Evita l'uso di JavaScript"], correct: 2, why: "Confronta la copia in memoria (diffing) e aggiorna nel DOM reale solo ciò che cambia." },
      { q: "Come si gestisce il cleanup di un effetto nei Functional Components?", o: ["Con componentWillUnmount", "Con useCallback", "Restituendo una funzione da useEffect", "Usando useMemo"], correct: 2, why: "useEffect può restituire una funzione di cleanup, eseguita allo smontaggio o prima del re-run." },
      { q: "Quale hook sostituisce componentDidMount, componentDidUpdate e componentWillUnmount?", o: ["useState", "useCallback", "useMemo", "useEffect"], correct: 3, why: "useEffect copre tutto il ciclo di vita degli effetti collaterali." },
      { q: "Quale metodo viene chiamato quando un componente viene rimosso dal DOM (class component)?", o: ["componentWillUnmount", "componentDidMount", "componentDidUpdate", "getSnapshotBeforeUpdate"], correct: 0, why: "componentWillUnmount è il lifecycle dello smontaggio: cleanup di timer e listener." },
      { q: "Perché React è considerato più scalabile dell'approccio tradizionale?", o: ["Elimina l'HTML", "Permette componenti isolati e riutilizzabili, facilitando team grandi e app complesse", "Non usa JavaScript", "Forza il reload della pagina"], correct: 1, why: "La componentizzazione rende l'app gestibile man mano che cresce." },
    ]
  },
  {
    id: "1.26", name: "Angular", questions: [
      { q: "Scopo principale di NgModule in Angular?", o: ["Gestire le richieste HTTP", "Organizzare componenti, direttive e servizi in blocchi funzionali", "Creare animazioni", "Gestire il DOM manualmente"], correct: 1, why: "NgModule raggruppa componenti/direttive/servizi correlati in un'unità coesa." },
      { q: "Quale decoratore definisce un componente Angular?", o: ["@Injectable", "@Directive", "@Component", "@Module"], correct: 2, why: "@Component (template, selector, stili). @Injectable per i servizi, @Directive per le direttive." },
      { q: "A cosa serve il Data Binding in Angular?", o: ["Collegare il database al DOM", "Sincronizzare dati tra template HTML e componente", "Fare il deploy", "Creare moduli lazy loading"], correct: 1, why: "Tiene allineati i dati del componente (TS) e ciò che si vede nel template (HTML)." },
      { q: "Differenza principale tra ngIf e ngFor?", o: ["ngIf crea componenti dinamici, ngFor no", "ngIf serve per condizioni, ngFor per iterare liste", "ngIf è per routing, ngFor per servizi", "ngIf funziona solo nei moduli lazy"], correct: 1, why: "*ngIf mostra/nasconde in base a una condizione; *ngFor ripete iterando su una collezione." },
      { q: "Quale servizio Angular si usa per le chiamate HTTP?", o: ["HttpService", "AjaxModule", "HttpClient", "FetchService"], correct: 2, why: "HttpClient (da @angular/common/http) è il servizio ufficiale, basato su Observable." },
    ]
  },
  {
    id: "1.27", name: "Progettazione e sviluppo applicazioni mobile (MAUI)", questions: [
      { q: "Definizione più corretta di HotReload:", o: ["Esegue le modifiche e mostra subito il risultato sul dispositivo senza riavviare il debug", "Fa consumare meno energia", "Avvia l'app più velocemente", "Blocca contenuti dannosi"], correct: 0, why: "Hot Reload applica al volo le modifiche mantenendo lo stato, senza ricompilare e riavviare." },
      { q: "In MAUI, quale di questi NON è un controllo di layout?", o: ["StackLayout", "BoxView", "Grid", "VerticalLayout"], correct: 1, why: "BoxView è un elemento grafico (rettangolo colorato), non un contenitore di layout." },
      { q: "In quale file si definisce il menù principale di un'app MAUI?", o: ["MainPage", "AppShell", "MauiProgram", "Startup"], correct: 1, why: "AppShell definisce la navigazione e il menu (flyout/tab). MauiProgram fa il bootstrap/DI." },
      { q: "Affermazione più corretta sui controlli in una pagina MAUI:", o: ["Ogni pagina ha un solo controllo di layout principale, figlio di ContentPage.Content, che a sua volta contiene più controlli", "Si possono mettere più controlli come figli di ContentPage.Content senza limiti", "Basta specificare la posizione in pixel", "Basta specificare la posizione in pixel"], correct: 0, why: "ContentPage.Content accetta UN solo figlio diretto: di norma un layout root (Grid/StackLayout)." },
    ]
  },
  {
    id: "1.28", name: "Progettazione e sviluppo applicazioni web e mobile su architettura Cloud", questions: [
      { q: "Annotazione Hibernate per mappare una classe Java a una tabella:", o: ["@Database", "@Entity", "@TableEntity", "@JpaModel"], correct: 1, why: "@Entity marca la classe come entità persistente. @Table ne specifica il nome. @TableEntity/@JpaModel non esistono." },
      { q: "Quale file Spring Boot contiene URL e credenziali del database MariaDB?", o: ["settings.gradle", "pom.xml", "application.properties", "import.sql"], correct: 2, why: "application.properties (o .yml) contiene url, username, password, dialect." },
      { q: "Con Hibernate, quale strategia genera automaticamente l'ID della tabella?", o: ["@AutoId", "@GeneratedValue", "@IdAuto", "@PrimaryKey"], correct: 1, why: "@GeneratedValue (con @Id) genera la PK (IDENTITY, SEQUENCE, AUTO...). Gli altri non esistono." },
      { q: "In una API REST, quale codice indica “Risorsa creata”?", o: ["200", "201", "400", "500"], correct: 1, why: "201 Created: la POST ha creato una nuova risorsa. 200 OK, 400 bad request, 500 errore server." },
      { q: "Vantaggio principale di JPA/Hibernate con un database SQL:", o: ["Permette query solo in SQL avanzato", "Elimina del tutto il database", "Mappa oggetti Java alle tabelle senza scrivere SQL manuale", "Funziona solo su Cloud"], correct: 2, why: "L'ORM mappa classi↔tabelle e oggetti↔righe, gestendo gran parte dell'SQL." },
    ]
  },
  {
    id: "2.01", name: "Problem Solving & Design Thinking", questions: [
      { q: "Primo passo fondamentale nel problem solving?", o: ["Generare idee col brainstorming", "Identificare un problema latente o una criticità", "Applicare i 5 perché", "Scegliere la soluzione più popolare"], correct: 1, why: "Tutto parte dall'individuare il problema. Brainstorming e 5 perché vengono dopo." },
      { q: "A cosa serve il problem setting?", o: ["Trovare la causa di un problema", "Definire il risultato atteso", "Raccogliere dati casuali", "Individuare le aree su cui è possibile intervenire"], correct: 3, why: "Il problem setting inquadra il problema e individua le aree d'intervento." },
      { q: "Obiettivo principale del brainstorming?", o: ["Giudicare subito le idee", "Produrre quante più idee possibili senza giudicarle", "Trovare una soluzione rapida", "Limitare il numero di idee"], correct: 1, why: "Regola d'oro: quantità senza giudizio, per liberare la creatività." },
      { q: "Quale tecnica del Design Thinking trasforma i problemi in opportunità progettuali?", o: ["How Might We", "Lateral Thinking", "Mind Mapping", "SWOT Analysis"], correct: 0, why: "“How Might We…?” riformula un problema in una domanda aperta e ottimista." },
      { q: "Caratteristica distintiva del metodo dei 6 cappelli?", o: ["Separare le attività mentali per concentrarsi su un aspetto alla volta", "Risolvere i conflitti tra partecipanti", "Identificare la causa radice", "Usare solo pensiero logico"], correct: 0, why: "I 6 cappelli di De Bono assegnano un tipo di pensiero per volta." },
      { q: "Cosa si intende per “decision taking”?", o: ["La valutazione delle opzioni", "La pianificazione di strategie decisionali", "Elaborare ipotesi senza decidere", "L'attuazione pratica di una decisione presa"], correct: 3, why: "Decision making = scegliere; decision taking = mettere in pratica." },
      { q: "Un vantaggio del Design Thinking per l'ICT?", o: ["Generare soluzioni rapide senza ricerca", "Sviluppare prototipi senza feedback", "Favorire un approccio centrato sull'utente", "Concentrarsi solo sulla tecnologia"], correct: 2, why: "Il cuore del DT è la centralità dell'utente (empatia + test)." },
      { q: "Strumento utile per rappresentare visivamente idee e connessioni?", o: ["Lateral Thinking", "Brainstorming", "Mappa mentale", "Parola casuale"], correct: 2, why: "La mappa mentale visualizza concetti e relazioni in modo radiale." },
      { q: "Cosa rappresenta il cappello blu nei 6 cappelli?", o: ["Il controllo e l'organizzazione del pensiero", "Creatività e innovazione", "Speranza e pensieri positivi", "Emozioni e sentimenti"], correct: 0, why: "Blu = meta-livello: gestisce il processo. Le emozioni sono il rosso, la creatività il verde." },
      { q: "Come si riassume l'essenza del Design Thinking?", o: ["Un processo lineare e rigido", "Una metodologia per risolvere problemi centrata su empatia e creatività", "Un approccio teorico ai conflitti", "Una tecnica per automatizzare decisioni"], correct: 1, why: "Il DT è iterativo e human-centered: empatia + creatività." },
      { q: "Quale vantaggio offre il brainstorming?", o: ["Identifica subito la soluzione migliore", "Evita persone con opinioni diverse", "Favorisce collaborazione e pensiero creativo", "Riduce il numero di idee"], correct: 2, why: "È collettivo e generativo: stimola collaborazione e idee." },
      { q: "Cosa distingue il Design Thinking da altri approcci?", o: ["Approccio rigidamente sequenziale", "Basato solo su dati oggettivi", "Combina logica ed empatia per affrontare le sfide", "Ignora il punto di vista dell'utente"], correct: 2, why: "La firma del DT è unire razionalità ed empatia." },
    ]
  },
  {
    id: "2.02", name: "Progetto Industriale", questions: [
      { q: "Cosa fa il comando docker build?", o: ["Avvia un container", "Crea un'immagine Docker da un Dockerfile", "Elenca i container in esecuzione", "Ferma un container"], correct: 1, why: "docker build legge il Dockerfile e produce un'immagine. Avviare = run, elencare = ps." },
      { q: "In quale linguaggio è scritto il file di Docker Compose?", o: ["JSON", "XML", "CSV", "YAML"], correct: 3, why: "docker-compose.yml è in YAML, basato su indentazione." },
      { q: "Cos'è un singleton (in Angular e in programmazione)?", o: ["Una classe istanziabile più volte con stati diversi", "Un design pattern che garantisce una sola istanza condivisa in tutta l'applicazione", "Un modulo Angular per le dipendenze globali", "Un componente visualizzabile una volta per pagina"], correct: 1, why: "Il Singleton garantisce un'unica istanza condivisa. In Angular i servizi providedIn:'root' lo sono." },
      { q: "Funzione principale di DbContext in EF Core?", o: ["Validare i dati lato client", "Tradurre SQL in C#", "Fare da ponte principale e da “Unit of Work” verso il database", "Autenticare gli utenti"], correct: 2, why: "DbContext rappresenta la sessione col DB: espone i DbSet, traccia le modifiche e le salva insieme." },
      { q: "A cosa serve la rotta wildcard '**' in Angular e dove va messa?", o: ["Definisce la home (/) e va per prima", "Intercetta URL senza parametri, ovunque", "Intercetta gli URL non in lazy loading", "Cattura qualsiasi URL non corrispondente e va sempre per ultima"], correct: 3, why: "'**' è la catch-all (tipicamente 404). Va in fondo, perché Angular valuta le rotte in ordine." },
      { q: "Differenza principale tra INNER JOIN e LEFT JOIN in SQL?", o: ["LEFT recupera solo colonne di sinistra, INNER tutte", "INNER include righe senza match nella ON", "Solo LEFT può usare WHERE", "INNER solo le righe con match in entrambe; LEFT tutte quelle di sinistra, anche senza match a destra"], correct: 3, why: "INNER = solo match in entrambe. LEFT = tutte le righe di sinistra, con NULL dove manca il match a destra." },
    ]
  },
];

const STORAGE_KEY = "afm_quiz_progress_v3";
const TOTAL = MODULES.reduce((s, m) => s + m.questions.length, 0);

function buildAll() {
  const arr = [];
  MODULES.forEach(m => m.questions.forEach((q, i) => {
    arr.push({ ...q, id: `${m.id}-${i + 1}`, moduleId: m.id, moduleName: m.name, num: i + 1 });
  }));
  return arr;
}
const ALL = buildAll();

function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

// Persistenza robusta: prova window.storage (anteprima Claude), poi localStorage (browser/React).
const Store = {
  async get(key) {
    try {
      if (typeof window !== "undefined" && window.storage && window.storage.get) {
        const r = await window.storage.get(key);
        if (r && r.value != null) return r.value;
      }
    } catch (e) {}
    try {
      if (typeof localStorage !== "undefined") {
        const v = localStorage.getItem(key);
        if (v != null) return v;
      }
    } catch (e) {}
    return null;
  },
  async set(key, value) {
    try {
      if (typeof window !== "undefined" && window.storage && window.storage.set) {
        await window.storage.set(key, value);
      }
    } catch (e) {}
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (e) {}
  },
};

export default function App() {
  const [progress, setProgress] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("home");
  const [deck, setDeck] = useState([]);
  const [deckLabel, setDeckLabel] = useState("");
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState(null);
  const [sessionLog, setSessionLog] = useState([]);

  useEffect(() => {
    (async () => {
      const val = await Store.get(STORAGE_KEY);
      if (val) {
        try { setProgress(JSON.parse(val)); } catch (e) {}
      }
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setProgress(next);
    await Store.set(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const mastered = useCallback((id) => (progress[id]?.streak || 0) >= 2, [progress]);

  const moduleStats = useMemo(() => MODULES.map(m => {
    const ids = m.questions.map((_, i) => `${m.id}-${i + 1}`);
    const done = ids.filter(id => (progress[id]?.streak || 0) >= 2).length;
    return { id: m.id, name: m.name, total: ids.length, mastered: done };
  }), [progress]);

  const totalMastered = moduleStats.reduce((s, m) => s + m.mastered, 0);

  function startDeck(questions, label) {
    if (!questions.length) return;
    setDeck(shuffle(questions)); setDeckLabel(label);
    setPos(0); setPicked(null); setSessionLog([]); setView("quiz");
  }

  function answer(idx) {
    if (picked !== null) return;
    setPicked(idx);
    const q = deck[pos];
    const isCorrect = idx === q.correct;
    const prev = progress[q.id] || { seen: 0, correct: 0, streak: 0 };
    persist({
      ...progress,
      [q.id]: { seen: prev.seen + 1, correct: prev.correct + (isCorrect ? 1 : 0), streak: isCorrect ? prev.streak + 1 : 0 },
    });
    setSessionLog(l => [...l, { id: q.id, correct: isCorrect }]);
  }

  function nextQ() {
    if (pos + 1 < deck.length) { setPos(pos + 1); setPicked(null); }
    else setView("results");
  }

  if (!loaded) {
    return <div style={{ fontFamily: THEME.sans, color: THEME.sub, padding: 40, background: THEME.bg, minHeight: "100vh" }}>Carico i progressi…</div>;
  }

  const L = "ABCD";

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh", fontFamily: THEME.sans, color: THEME.ink }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 18px 64px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Ripasso esame <span style={{ color: THEME.primary }}>FSD</span>
          </h1>
          <div style={{ fontSize: 13, color: THEME.sub, fontFamily: THEME.mono }}>{totalMastered}/{TOTAL} padroneggiate</div>
        </div>
        <div style={{ height: 6, background: THEME.line, borderRadius: 99, overflow: "hidden", marginBottom: 22 }}>
          <div style={{ width: `${(totalMastered / TOTAL) * 100}%`, height: "100%", background: THEME.primary, transition: "width .4s" }} />
        </div>

        {view === "home" && (
          <Home moduleStats={moduleStats}
            onAll={() => startDeck(ALL, "Tutte le domande")}
            onReview={() => startDeck(ALL.filter(q => !mastered(q.id)), "Da ripassare")}
            onModule={(mid) => {
              const m = MODULES.find(x => x.id === mid);
              const qs = m.questions.map((q, i) => ({ ...q, id: `${m.id}-${i + 1}`, moduleId: m.id, moduleName: m.name, num: i + 1 }));
              startDeck(qs, `${m.id} — ${m.name}`);
            }}
            dueCount={ALL.filter(q => !mastered(q.id)).length}
            onReset={async () => { await persist({}); }}
          />
        )}

        {view === "quiz" && deck[pos] && (
          <Quiz q={deck[pos]} pos={pos} total={deck.length} picked={picked} label={deckLabel} L={L}
            onAnswer={answer} onNext={nextQ} onQuit={() => setView("home")} />
        )}

        {view === "results" && (
          <Results log={sessionLog} deck={deck} L={L} label={deckLabel}
            onHome={() => setView("home")}
            onWrongAgain={() => {
              const wrongIds = sessionLog.filter(x => !x.correct).map(x => x.id);
              const again = deck.filter(q => wrongIds.includes(q.id));
              if (again.length) startDeck(again, "Errori di prima"); else setView("home");
            }}
          />
        )}
      </div>
    </div>
  );
}

function Home({ moduleStats, onAll, onReview, onModule, dueCount, onReset }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
        <button onClick={onAll} style={bigBtn(THEME.primary, "#fff")}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Tutte le domande</div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>{TOTAL} in ordine casuale</div>
        </button>
        <button onClick={onReview} disabled={!dueCount} style={bigBtn(dueCount ? THEME.amber : THEME.line, dueCount ? "#fff" : THEME.sub)}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Da ripassare</div>
          <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>{dueCount ? `${dueCount} non ancora sicure` : "tutto padroneggiato!"}</div>
        </button>
      </div>

      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: THEME.sub, fontWeight: 700, marginBottom: 10 }}>Per modulo</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {moduleStats.map(m => {
          const pct = m.mastered / m.total;
          const full = m.mastered === m.total;
          return (
            <button key={m.id} onClick={() => onModule(m.id)} style={modRow()}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ fontFamily: THEME.mono, fontSize: 12, color: THEME.primary, fontWeight: 700, flexShrink: 0 }}>{m.id}</span>
                <span style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 64, height: 5, background: THEME.line, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${pct * 100}%`, height: "100%", background: full ? THEME.good : THEME.primary }} />
                </div>
                <span style={{ fontFamily: THEME.mono, fontSize: 12, color: full ? THEME.good : THEME.sub, width: 38, textAlign: "right" }}>{m.mastered}/{m.total}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 28, padding: "14px 16px", background: THEME.primarySoft, borderRadius: 12, fontSize: 13, color: THEME.primary, lineHeight: 1.5 }}>
        Una domanda conta come <strong>padroneggiata</strong> dopo 2 risposte giuste di fila. I progressi restano salvati tra le sessioni. Per la settimana: un giro di “Tutte le domande”, poi ogni giorno solo <strong>Da ripassare</strong> finché la barra non è piena.
      </div>

      <button onClick={onReset} style={{ marginTop: 16, background: "none", border: "none", color: THEME.sub, fontSize: 12, textDecoration: "underline", cursor: "pointer", padding: 4 }}>
        Azzera tutti i progressi
      </button>
    </div>
  );
}

function Quiz({ q, pos, total, picked, label, L, onAnswer, onNext, onQuit }) {
  const answered = picked !== null;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button onClick={onQuit} style={{ background: "none", border: "none", color: THEME.sub, fontSize: 13, cursor: "pointer", padding: 0 }}>← Home</button>
        <div style={{ fontFamily: THEME.mono, fontSize: 12, color: THEME.sub }}>{label} · {pos + 1}/{total}</div>
      </div>

      <div style={{ background: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: 16, padding: "22px 20px", boxShadow: "0 1px 2px rgba(20,30,50,0.04)" }}>
        <div style={{ fontFamily: THEME.mono, fontSize: 11, color: THEME.primary, fontWeight: 700, marginBottom: 8 }}>{q.moduleId} · {q.moduleName}</div>
        <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.45, marginBottom: 18, whiteSpace: "pre-wrap" }}>{q.q}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {q.o.map((opt, i) => {
            const isCorrect = i === q.correct;
            const isPicked = i === picked;
            let bg = THEME.surface, border = THEME.line, color = THEME.ink, badge = THEME.primarySoft, badgeC = THEME.primary;
            if (answered) {
              if (isCorrect) { bg = THEME.goodSoft; border = THEME.good; badge = THEME.good; badgeC = "#fff"; }
              else if (isPicked) { bg = THEME.badSoft; border = THEME.bad; badge = THEME.bad; badgeC = "#fff"; }
              else { color = THEME.sub; }
            }
            return (
              <button key={i} onClick={() => onAnswer(i)} disabled={answered}
                style={{ display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", background: bg, border: `1.5px solid ${border}`, borderRadius: 12, padding: "12px 14px", cursor: answered ? "default" : "pointer", color, fontFamily: THEME.sans, fontSize: 15, lineHeight: 1.4, transition: "all .12s" }}>
                <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, background: badge, color: badgeC, fontFamily: THEME.mono, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>{L[i]}</span>
                <span style={{ paddingTop: 2 }}>{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div style={{ marginTop: 16, padding: "13px 15px", background: THEME.bg, borderRadius: 12, borderLeft: `3px solid ${picked === q.correct ? THEME.good : THEME.amber}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: picked === q.correct ? THEME.good : THEME.amber, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {picked === q.correct ? "Giusto" : `Risposta: ${L[q.correct]}`}
            </div>
            <div style={{ fontSize: 14, color: THEME.ink, lineHeight: 1.5 }}>{q.why}</div>
          </div>
        )}
      </div>

      {answered && (
        <button onClick={onNext} style={{ marginTop: 16, width: "100%", background: THEME.primary, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: THEME.sans }}>
          {pos + 1 < total ? "Prossima →" : "Vedi risultati"}
        </button>
      )}
    </div>
  );
}

function Results({ log, deck, L, label, onHome, onWrongAgain }) {
  const correct = log.filter(x => x.correct).length;
  const wrong = log.length - correct;
  const wrongIds = log.filter(x => !x.correct).map(x => x.id);
  const wrongQs = deck.filter(q => wrongIds.includes(q.id));
  const pct = log.length ? Math.round((correct / log.length) * 100) : 0;

  return (
    <div>
      <div style={{ background: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: THEME.sub, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: pct >= 80 ? THEME.good : pct >= 60 ? THEME.amber : THEME.bad, letterSpacing: "-0.03em" }}>{pct}%</div>
        <div style={{ fontSize: 14, color: THEME.sub, marginTop: 2 }}>{correct} giuste · {wrong} sbagliate · {log.length} totali</div>
      </div>

      {wrongQs.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: THEME.sub, fontWeight: 700, marginBottom: 10 }}>Da rivedere</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {wrongQs.map(q => (
              <div key={q.id} style={{ background: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: 12, padding: "12px 14px" }}>
                <div style={{ fontFamily: THEME.mono, fontSize: 11, color: THEME.primary, fontWeight: 700, marginBottom: 4 }}>{q.moduleId}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{q.q}</div>
                <div style={{ fontSize: 13, color: THEME.good, fontWeight: 600 }}>{L[q.correct]}. {q.o[q.correct]}</div>
                <div style={{ fontSize: 13, color: THEME.sub, marginTop: 4, lineHeight: 1.5 }}>{q.why}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        {wrongQs.length > 0 && (
          <button onClick={onWrongAgain} style={{ flex: 1, background: THEME.amber, color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Riprova gli errori</button>
        )}
        <button onClick={onHome} style={{ flex: 1, background: THEME.surface, color: THEME.ink, border: `1.5px solid ${THEME.line}`, borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Torna alla home</button>
      </div>
    </div>
  );
}

function bigBtn(bg, color) {
  return { background: bg, color, border: "none", borderRadius: 14, padding: "16px 16px", textAlign: "left", cursor: "pointer", fontFamily: THEME.sans };
}
function modRow() {
  return { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: THEME.surface, border: `1px solid ${THEME.line}`, borderRadius: 11, padding: "11px 14px", cursor: "pointer", fontFamily: THEME.sans, color: THEME.ink, width: "100%" };
}
