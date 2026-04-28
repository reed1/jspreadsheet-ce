const { expect } = require('chai');

const jspreadsheet = require('../dist/index.js');

describe('Krisna fork: showAllDecimals defaults to true for masked numeric columns', () => {
    const buildInstance = (data, columns) =>
        jspreadsheet(root, {
            tabs: true,
            worksheets: [
                {
                    minDimensions: [1, 1],
                    data,
                    columns,
                    worksheetName: 'Sheet1',
                },
            ],
        });

    it('by default a masked column shows every decimal of the value', () => {
        const instance = buildInstance([['1.2345']], [{ type: 'numeric', mask: '0.00' }]);
        expect(instance[0].getCell('A1').textContent).to.eq('1.2345');
        expect(instance[0].getValueFromCoords(0, 0)).to.eq('1.2345');
    });

    it('mask precision still acts as a minimum when value has fewer decimals', () => {
        const instance = buildInstance([['1.2']], [{ type: 'numeric', mask: '0.00' }]);
        expect(instance[0].getCell('A1').textContent).to.eq('1.20');
    });

    it('preserves currency prefix and thousand separators while expanding decimals', () => {
        const instance = buildInstance([['1234.56789']], [{ type: 'numeric', mask: 'Rp #,##0.00' }]);
        expect(instance[0].getCell('A1').textContent).to.eq('Rp 1,234.56789');
    });

    it('expands both sections of a signed mask', () => {
        const instance = buildInstance([['-1.2345']], [{ type: 'numeric', mask: '0.00;-0.00' }]);
        expect(instance[0].getCell('A1').textContent).to.eq('-1.2345');
    });

    it('integer-only mask is unaffected — there is no decimal section to extend', () => {
        const instance = buildInstance([['12.5']], [{ type: 'numeric', mask: '#,##0' }]);
        expect(instance[0].getCell('A1').textContent).to.eq('13');
    });

    it('showAllDecimals: false opts out and restores stock truncation', () => {
        const instance = buildInstance([['1.2345']], [{ type: 'numeric', mask: '0.00', showAllDecimals: false }]);
        expect(instance[0].getCell('A1').textContent).to.eq('1.23');
    });

    it('showAllDecimals: true is equivalent to the default', () => {
        const instance = buildInstance([['1.2345']], [{ type: 'numeric', mask: '0.00', showAllDecimals: true }]);
        expect(instance[0].getCell('A1').textContent).to.eq('1.2345');
    });
});
