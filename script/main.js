var deckList = [];
$('#calculator').hide();

const readDecklist = function(){
    let file = $('#input_decklist').prop('files')[0];
    const reader = new FileReader();
    let data = reader.readAsText(file);
    reader.addEventListener('load', (e) => {
        let lines = e.target.result.split('\n');
        // Remove the author because ygoprodeck doesn't support it
        if (lines[0].includes('#created by')) {
            lines.splice(0, 1);
        }
        let realLines = lines.join('\n');
        let alines = realLines.replaceAll(' ', '').replaceAll('#main\r\n', '').replaceAll('#extra\r\n', '').replaceAll('!side\r\n', '').replaceAll('\r\n', ',');
        alines = alines.substring(0, alines.length - 1);
        $.getJSON('https://db.ygoprodeck.com/api/v7/cardinfo.php?id=' + alines)
        .then(function(response) {
            deckList = [];
            for(data of response.data) {
                if (data.frameType === 'normal' || data.frameType === 'effect') {
                    deckList.push({
                        id: data.id,
                        name: data.name,
                        race: data.race,
                        attribute: data.attribute,
                        level: data.level,
                        atk: data.atk,
                        def: data.def
                    });
                }
            }
        })
        .then(function() {
            let deck =      "<nav><ul id = \"deck\" class = \"deck\">";
            for (card of deckList) {
                deck +=         "<li class = \"row\">" + card.name + "</li>"
            }
            deck +=         "</ul></nav>";
            $('#decklist').html(deck);
            $('.card-list').html(getAsOptions(deckList));
            $('#calculator').show();
            $('#input-hand-banish-1').change();
            $('#input-hand-banish-2').change();
        })
    });
};

const updateBridgeSelect = function() {
    var selectedCard = deckList.filter(card => card.id == $('#input-hand-banish-1').val())[0];
    var bridgeList = deckList.filter(card => shareExactlyOneProperty(card, selectedCard));
    $('#input-bridge').html(getAsOptions(bridgeList));
}

function getAsOptions(deckList) {
    let options = "";
    for (card of deckList) {
        options += "<option value =" + card.id + ">" + card.name + "</option>";
    }
    return options;
}

const calculateTarget = function() {
    var result = "";
    var selectedCard = deckList.filter(card => card.id == $('#input-bridge').val())[0];
    var targetList = deckList.filter(card => shareExactlyOneProperty(card, selectedCard));
    for (card of targetList) {
        result += "<li style = >";
        result += card.name;
        result += "</li>";
    }
    $('#calculate-result').html(result);
};

function shareExactlyOneProperty(card1, card2) {
    return (card1.type === card2.type
            && card1.attribute != card2.attribute
            && card1.level != card2.level
            && card1.atk != card2.atk
            && card1.def != card2.def)
        || (card1.type != card2.type
            && card1.attribute === card2.attribute
            && card1.level != card2.level
            && card1.atk != card2.atk
            && card1.def != card2.def)
        || (card1.type != card2.type
            && card1.attribute != card2.attribute
            && card1.level === card2.level
            && card1.atk != card2.atk
            && card1.def != card2.def)
        || (card1.type != card2.type
            && card1.attribute != card2.attribute
            && card1.level != card2.level
            && card1.atk === card2.atk
            && card1.def != card2.def)
        || (card1.type != card2.type
            && card1.attribute != card2.attribute
            && card1.level != card2.level
            && card1.atk != card2.atk
            && card1.def === card2.def);
}

$('#input_decklist').on('change', readDecklist);

$('#input-hand-banish-1').on('change', updateBridgeSelect);

$('#target-calculate-btn').on('click', calculateTarget);