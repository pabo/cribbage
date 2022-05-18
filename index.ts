
enum Suit {
	Hearts,
	Clubs,
	Diamonds,
	Spades
}

enum Rank {
	Ace,
	Two,
	Three,
	Four,
	Five,
	Six,
	Seven,
	Eight,
	Nine,
	Ten,
	Jack,
	Queen,
	King
};

type CardParams = {
	rank?: Rank;
	suit?: Suit;
	index?: number;
}

class Card {
	private rank: Rank;
	private suit: Suit;
	private index: number;
	
	constructor({rank, suit, index}: CardParams) {
		if (index !== undefined) {
			// @ts-ignore
			this.rank = Rank[Rank[index % 13]];
			// @ts-ignore
			this.suit = Suit[Suit[Math.floor(index / 13)]];
			this.index = index;
		}
		else {
			// @ts-ignore
			this.rank = rank;
			// @ts-ignore
			this.suit = suit;
			this.index = this.rank + this.suit*13;
		}
	}

	isPairWith(card: Card) {
		return this.rank === card.rank;
	}


	get value() {
		return this.rank >= 9 ? 10 : this.rank + 1;
	}

	stringify() {
		return `${Rank[this.rank]} of ${Suit[this.suit]} (${this.index})`;
	}

}

// This class 'Hand' is a collection of cards. It could be the 4 cards in a players hand,
// the 5 cards of the players hand plus the flip, or any other collection of n cards
class Hand {
	private cards: Card[];

	constructor(cards: Card[]) {
		this.cards = cards;
	}

	get numCards() {
		return this.cards.length;
	}

	get isPair() {
		return this.numCards === 2 && this.cards[0].isPairWith(this.cards[1]);
	}

	get score() {
		let score = 0;
		// pairs
		for (let possiblePairs of this.choose2()) {
			if (possiblePairs.isPair) {
				score += 2;
			}
		}

		// 15s
		// start with every card, and add every other card until you hit or exceed 15
		for(let card1 = 0; card1 < this.cards.length; card1++) {
			for(let card2 = card1+1; card2 < this.cards.length; card2++) {
				const sum12 = this.cards[card1].value + this.cards[card2].value
				if (sum12 === 15) {
					score += 2;
				}
				else if (sum12 <= 15) {
					for(let card3 = card2+1; card3 < this.cards.length; card3++) {
						const sum123 = sum12 + this.cards[card3].value;
						if (sum123 === 15) {
							score += 2;
						}
					}
				}
			}
		}
					// for(let card4 = card3+1; card4 < this.cards.length; card4++) {
						// for(let card5 = card4+1; card5 < this.cards.length; card5++) {
							// for(let card6 = card5+1; card6 < this.cards.length; card6++) {
							// }
						// }
					// }
				// }
			// }
		// }
	

		return score;
		// return this.cards.map(card => card.value).reduce((acc, curr) => acc + curr);
	}

	stringify() {
		return this.cards.map(card => card.stringify()).join(", ");
	}

	// thisHand.length Choose 4
	// TODO: generalize to choose n
	
	// without order, its the same as 6 choose 2, which is 6 * 5 / 2 = 15 
	// returns an array of Hands
	// 1 2 3 4 (5 6) 
	// 1 2 3 5 (4 6)
	// 1 2 3 6 (4 5)
	// 1 2 4 5 (3 6)
	// 1 2 4 6 (3 5)
	// 1 2 5 6 (3 4)
	// 1 3 4 5 (2 6)
	// 1 3 4 6 (2 5)
	// 1 3 5 6 (2 4)
	// 1 4 5 6 (2 3)
	// 3 4 5 6 (1 2)
	// 2 4 5 6 (1 3)
	// 2 3 5 6 (1 4)
	// 2 3 4 6 (1 5)
	// 2 3 4 5 (1 6)

	choose2() {
		const choices = [];

		for(let card1 = 0; card1 < this.cards.length; card1++) {
			for(let card2 = card1+1; card2 < this.cards.length; card2++) {
				choices.push(new Hand([this.cards[card1], this.cards[card2]]));
			}
		}

		return choices;
	}

	choose4() {
		const choices = [];

		for(let card1 = 0; card1 < this.cards.length; card1++) {
			for(let card2 = card1+1; card2 < this.cards.length; card2++) {
				choices.push(new Hand(this.cards.filter((card, index) => index !== card1 && index !== card2)));
			}
		}

		return choices;
	}
}

// const card = new Card(Rank.Ace, Suit.Hearts);
// const card = new Card({index: 32});
// console.log(`card is ${card.stringify()} with a value of ${card.value}`);


// generate every possible combination of 6 cards, generate every possible kept hand of 4 cards, and score them
for(let card1 = 0; card1 < 52; card1++) {
	for(let card2 = card1+1; card2 < 52; card2++) {
		for(let card3 = card2+1; card3 < 52; card3++) {
			for(let card4 = card3+1; card4 < 52; card4++) {
				for(let card5 = card4+1; card5 < 52; card5++) {
					for(let card6 = card5+1; card6 < 52; card6++) {
						// for(let starter = card2+1; card3 < 52; card3++) {
						const hand = new Hand([
							new Card({index: card1}),
							new Card({index: card2}),
							new Card({index: card3}),
							new Card({index: card4}),
							new Card({index: card5}),
							new Card({index: card6}),
						]);

						console.log(`Here's a hand: ${hand.stringify()} whose score(sum) is ${hand.score}`);
						const choices = hand.choose4();
						choices.forEach(choice => {
							console.log(`possible choice: ${choice.stringify()} whose score(sum) is ${choice.score}`);
						})
					}
				}
			}
		}
	}
}
