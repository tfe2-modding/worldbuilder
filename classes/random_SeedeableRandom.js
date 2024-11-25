random_SeedeableRandom.prototype.getInt = function(orig) {
	return function(val0, val1) {
		if (val0 == val1) {
			this.getInt64()
			return val0
		} else {
			return orig.apply(this, arguments)
		}
	}
} (random_SeedeableRandom.prototype.getInt)

random_SeedeableRandom.prototype.getFloat = function(orig) {
	return function(val0, val1) {
		if (val0 == val1) {
			this.getInt64()
			return val0
		} else {
			return orig.apply(this, arguments)
		}
	}
} (random_SeedeableRandom.prototype.getFloat)