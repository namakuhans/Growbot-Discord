const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

function createStyleSelectMenu(selectedStyle = 'fill_value') {
  const styleStr = String(selectedStyle);

  return new StringSelectMenuBuilder()
    .setCustomId('select_style')
    .setPlaceholder('🎨 Select Visualization Style...')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 1').setValue('fill_value').setDefault(styleStr === 'fill_value'),
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 2').setValue('bubble').setDefault(styleStr === 'bubble'),
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 3').setValue('sparkline').setDefault(styleStr === 'sparkline'),
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 4').setValue('horizontal_bar').setDefault(styleStr === 'horizontal_bar'),
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 5').setValue('stepped_line').setDefault(styleStr === 'stepped_line'),
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 6').setValue('point_circle').setDefault(styleStr === 'point_circle'),
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 7').setValue('point_triangle').setDefault(styleStr === 'point_triangle'),
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 8').setValue('hide_axes').setDefault(styleStr === 'hide_axes'),
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 9').setValue('no_fill').setDefault(styleStr === 'no_fill'),
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 10').setValue('formatted_numbers').setDefault(styleStr === 'formatted_numbers'),
      new StringSelectMenuOptionBuilder().setLabel('Visual Menu 11').setValue('vertical_axis').setDefault(styleStr === 'vertical_axis')
    );
}

module.exports = { createStyleSelectMenu };
