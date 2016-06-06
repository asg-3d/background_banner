(function() {
	var _blocksPlaces = {};

	_blocksPlaces.updateColumns = function() {
		var oldColumnsQuantity = modulesMediator.columns.oldColumnsQuantity,
			newColumnsQuantity = modulesMediator.columns.newColumnsQuantity;

		if (newColumnsQuantity == oldColumnsQuantity) return;

		if (modulesMediator.columns.oldColumnsQuantity !== 0) modulesMediator.emit('columns.hideColumns');

		modulesMediator.emit('columns.showColumns');

	};
	_blocksPlaces.updateColumns();

	modulesMediator.on('columns.widthChanged', _blocksPlaces.updateColumns);

	modulesMediator.blocksPlaces = _blocksPlaces;
})();