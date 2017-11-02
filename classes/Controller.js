class Controller {
	getUnixTime() {
		return Math.floor(new Date().getTime() / 1000);
	}

	consoleTime() {
		var date = new Date();
			date.setHours(date.getHours() + 6);
		var day = date.getDate();
		var month = date.getMonth();
		var year = date.getFullYear();
		var hours = date.getHours();
		var minutes = date.getMinutes();

		day = this.zeroAdd(day);
		month = this.zeroAdd(month);
		hours = this.zeroAdd(hours);
		minutes = this.zeroAdd(minutes);

		return `${day}.${month}.${year} - ${hours}:${minutes}`;
	}

	zeroAdd(numb) {
		return (numb > 9 ? numb : "0" + numb);
	}
}

module.exports = Controller;