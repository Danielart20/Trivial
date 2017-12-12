let game = {
	teams: {
		team_1: {
			name: null,
			color: '#000000',
			category_1: 0,
			category_2: 0,
			category_3: 0,
			category_4: 0,
			category_5: 0,
			consecutive_success: 0,
			score: 0,
			lastest_categories_selected: [0,0]
		},
		team_2: {
			name: null,
			color: '#000000',
			category_1: 0,
			category_2: 0,
			category_3: 0,
			category_4: 0,
			category_5: 0,
			consecutive_success: 0,
			score: 0,
			lastest_categories_selected: [0,0]
		},
		team_3: {
			name: null,
			color: '#000000',
			category_1: 0,
			category_2: 0,
			category_3: 0,
			category_4: 0,
			category_5: 0,
			consecutive_success: 0,
			score: 0,
			lastest_categories_selected: [0,0]
		},
		team_4: {
			name: null,
			color: '#000000',
			category_1: 0,
			category_2: 0,
			category_3: 0,
			category_4: 0,
			category_5: 0,
			consecutive_success: 0,
			score: 0,
			lastest_categories_selected: [0,0]
		}
	},
	categories: {
		category_1: {
			id: null,
			name: null
		},
		category_2: {
			id: null,
			name: null
		},
		category_3: {
			id: null,
			name: null
		},
		category_4: {
			id: null,
			name: null
		},
		category_5: {
			id: null,
			name: null
		}
	},
	turn: [1,2,3,4],
	is_turn_for: null,
	game_categories: null,
	category_selected: 0,
	current_question: null,
	countdown: 30,
	token: null
}

let ids_from_opentdb = [];
let names_from_opentdb = [];

let populate_categories = function(category) {

	api_url = function(category) {
		return 'https://opentdb.com/api_category.php';
	},

	populate = function(categories) {
		for (let i = 0; i < categories.length; i++) {
			ids_from_opentdb.push(categories[i].id);
			names_from_opentdb.push(categories[i].name);
		}
	},

	function() {
		let that = this;
		$.ajax({
			url: that.api_url()
		}).done(function(data) {
			console.log(data);
			that.populate(data.trivia_categories);
		});
	}()
}

let shuffle = function(array) {
	let counter = array.length;
	while (counter > 0) {
		let index = Math.floor(Math.random() * counter);
		counter--;
		let temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}
	return array;
}

/* Ordenamos aleatoriamente los turnos en esta partida. */
if (game.is_turn_for === null) {
	game.turn = shuffle(game.turn);
	game.is_turn_for = 0;
}

populate_categories();

localStorage.removeItem('game'); 

/* Iniciamos la cuenta atrás */
let start_countdown = function() {
	window.my_interval = setInterval(function(){
		if (game.countdown > 0) {
			game.countdown -= 1;
			$('.countdown').html(game.countdown + 's');
		} else {
			$('.countdown').html('30s');
			clearInterval(window.my_interval);
			show_category_selector();
			change_turn();
		}
		persist_game();
	}, 1000);
}

if (localStorage.getItem('game') !== null) {
	game = JSON.parse(atob(localStorage.getItem('game')));
}
let persist_game = function() {
	localStorage.setItem('game', btoa(JSON.stringify(game)));
}

let new_game = function() {
	/* Creamos los equipos con sus colores. */
	if (game.teams.team_1.name === null) {
		for (let i = 1; i <= 4; i++) {
			game.teams['team_' + i].name = $('#team_' + i + '_name').val();
			$('#team_' + i + '_aside_name').html(game.teams['team_' + i].name);
			game.teams['team_' + i].color = $('#team_' + i + '_color').val();
			$('.container_team_' + i + ' .div_index, .container_team_' + i + ' .panel').attr('style','background-color:'+game.teams['team_' + i].color+';');
		}
	}

	/* Elegimos las categorías que se jugarán en esta partida aleatoriamente y las almacenamos. */
	if (game.game_categories === null) {
		game.game_categories = [];
		for (let i = 0; i < 5; i++) {
			let random = Math.floor(Math.random()*ids_from_opentdb.length);
			game.game_categories.push(ids_from_opentdb[random]);
			game.categories['category_' + (i + 1)].id = ids_from_opentdb[random];
			game.categories['category_' + (i + 1)].name = names_from_opentdb[random];
		}
	}
}

/* Funciones para llamar a una pregunta nueva */
let get_new_question = function(category, funct) {

	api_url = function(category) {
		return 'https://opentdb.com/api.php?amount=1&category=' + category + '&type=multiple&token=' + game.token;
	},

	store_question = function(questions) {
		game.current_question = {
			question: questions[0].question,
			correct_answer: questions[0].correct_answer,
			incorrect_answers: questions[0].incorrect_answers
		};
	},

	call = function() {
		let that = this;
		$.ajax({
			url: that.api_url(category)
		}).done(function(data) {
			that.store_question(data.results);
			funct();
		});
	},

	function() {
		let that = this;
		if (game.token === null) {
			$.ajax({
				url: 'https://opentdb.com/api_token.php?command=request'
			}).done(function(data) {
				game.token = data.token;
				that.call();
			});
		} else {
			that.call();
		}
	}()
}

let change_turn = function() {
	$('.container_team_' + game.turn[game.is_turn_for] + ' .panel').removeClass('turn');
	if (game.is_turn_for !== 3) {
		game.is_turn_for += 1;
	} else {
		game.is_turn_for = 0;
	}
	$('.container_team_' + game.turn[game.is_turn_for] + ' .panel').addClass('turn');
}

let check_score_and_trophies = function() {
	for (team in game.teams) {
		/* Actualizamos la puntuación */
		$('#' + team + '_score').html(game.teams[team].score)
		/* Actualizamos los trofeos */
		for (let i = 1; i <= 5; i++) {
			if (game.teams[team]['category_' + i] === 3) {
				$('.container_' + team + ' .trophy_of_category_' + i).addClass('achieved');
			}
		}
	}
}

let check_answer = function(button){
	let time_change_color = 300;
	let time_change_turn = 1500;
	clearInterval(window.my_interval);
	setTimeout(function(){
		$('.answer_button').addClass('incorrect');
		$('.answer_button[data_value="' + game.current_question.correct_answer + '"]').addClass('correct');
	}, time_change_color);
	setTimeout(function(){
		$('.answer_button').removeClass('incorrect correct');
		$('.countdown').html('30s');
		let answer = $(button).attr('data_value');
		let current_team = 'team_' + game.turn[game.is_turn_for];
		if (game.current_question.correct_answer === answer) {
			game.teams[current_team].score += 10;
			if (game.teams[current_team].consecutive_success === 5) {
				console.log('Quitar trofeo');
			}
			game.teams[current_team].consecutive_success += 1;
			game.teams[current_team]['category_' + game.category_selected] += 1;
		} else {
			game.teams[current_team].consecutive_success = 0;
		}
		change_turn();
		check_order();
		check_score_and_trophies();
		show_category_selector();
	}, time_change_turn);
};

let check_order = function() {
	let scores = [
	{score: game.teams.team_1.score, team:'team_1'},
	{score: game.teams.team_2.score, team:'team_2'},
	{score: game.teams.team_3.score, team:'team_3'},
	{score: game.teams.team_4.score, team:'team_4'}
	];
	scores = scores.sort(function(a, b){
		let keyA = a.score,
		keyB = b.score;
		if(keyA < keyB) return 1;
		if(keyA > keyB) return -1;
		return 0;
	});
	for (let i = 0; i < scores.length; i++) {
		$('.container_' + scores[i].team).removeClass('position1 position2 position3 position4');
		$('.container_' + scores[i].team).addClass('position' + (i + 1));
	}
}

let show_team_selector = function() {
	$('#team_selector').show();
	$('#game').hide();
}

let show_category_selector = function() {
	let current_team = game.teams['team_' + game.turn[game.is_turn_for]];
	for (let i = 1; i <= 5; i++) {
		if (current_team['category_' + i] === 3 || (current_team.lastest_categories_selected[0] == i && current_team.lastest_categories_selected[1] == i)) {
			$('#category_selector #category_' + i).hide();
		} else {
			$('#category_selector #category_' + i).show();
		}
		$('#category_selector #category_' + i).attr('data_value', game.categories['category_' + i].id);
		$('#category_selector #category_' + i + ' span').html(game.categories['category_' + i].name);
	}
	/* Mostrar */
	$('#team_selector').hide();
	$('#game').show();
	$('#category_selector').show();
	$('#question').hide();
}

let show_question = function() {
	$('#question #question_text').html(game.current_question.question);
	let array = game.current_question.incorrect_answers;
	array.push(game.current_question.correct_answer);
	/*Se randomiza la posición de la respuesta correcta*/
	array = shuffle(array);
	$('#question #answer_1').html(array[0]);
	$('#question #answer_2').html(array[1]);
	$('#question #answer_3').html(array[2]);
	$('#question #answer_4').html(array[3]);
	$('#question #answer_1').attr('data_value', array[0]);
	$('#question #answer_2').attr('data_value', array[1]);
	$('#question #answer_3').attr('data_value', array[2]);
	$('#question #answer_4').attr('data_value', array[3]);
	$('#team_selector').hide();
	$('#game').show();
	$('#category_selector').hide();
	$('#question').show();
}

$('#play_button').on('click', function(e) {
	e.preventDefault();
	new_game();
	show_category_selector();
	$('.container_team_' + game.turn[game.is_turn_for] + ' .panel').addClass('turn');
});

$('.category_button').on('click', function(e) {
	e.preventDefault();
	game.category_selected = $(this).attr('data_category');
	let current_team = game.teams['team_' + game.turn[game.is_turn_for]];
	current_team.lastest_categories_selected[0] = current_team.lastest_categories_selected[1];
	current_team.lastest_categories_selected[1] = game.category_selected;
	get_new_question($(this).attr('data_value'), function(){
		game.countdown = 30;
		start_countdown();
		show_question();
	});
});

$('.answer_button').on('click', function(e) {
	e.preventDefault();
	check_answer(this);
});

/*

Todo list

[ X ]Debemos poder crear hasta 4 equipos, antes de comenzar a jugar, cada uno de ellos identificado con un color para su mejor visualuzación
[ X ]Antes de comenzar a jugar debemos escoger 5 categorías aleatorias de las ofrecidas por el API para que sean las usadas por los equipos durante la partida.
[ X ]El turno de los equipos es aleatorio, se establece al empezar la partida, y se respeta hasta la finalización de la misma.
[ X ]En cada turno, el equipo al que le toque seleccionará la categoría sobre la que hacer la pregunta.  
[ X ]Cuando todos los equipos hayan respondido una pregunta de la categoría seleccionada se acaba un turno.
[ X ]Cuando un equipo acierte 3 preguntas de una misma categoría, se le dará el "trofeo" de esa categoría.
[ X ]Cada pregunta acertada da 10 puntos.
[   ]Un equipo gana cuando tiene el trofeo de 5 categorías.
[ X ]Para responder a cada pregunta se establece un tiempo máximo de 30 segundos.
[ ~ ]El estado del juego debe ser persistido en todo momento, ya que si se nos cierra el navegador debemos poder seguir jugando donde lo dejamos.
	La interfaz debe mostrar:
	[ X ]El nombre y el color de los equipos que participan.
	[ X ]Las categorías usadas en la partida.  * Para cada categora, que equipos han obtenido ya el trofeo.
	[ X ]* El marcador de la partida ordenado de mayor a menor puntuacin de los equipos.    
	[ X ]* En cada pregunta, mostrar el equipo que debe responder así como el tiempo que le queda para hacerlo.
	[ X ]* Hay que controlar que los equipos no siempre seleccionen la misma categora. Un equipo puede escoger la misma categoría en dos turnos consecutivos, en el tercer turno no podr repetir elección.
	[   ]Si un equipo acierta 5 preguntas consecutivas, puede "restar" un trofeo a cualquier otro equipo.

Falta finalizar el juego al conseguir los 5 trofeos.
Terminar de ajustar la funcionalidad para persistir el juego. (Partida nueva o continuar, si continúa, ejecutar lo necesario)
Pensar cómo eliminar algun trofeo ya obtenido
Controlar clickar dos veces en la misma respuesta

*/