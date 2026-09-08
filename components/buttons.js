const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

function createStyleSelectMenu() {
  return new StringSelectMenuBuilder()
    .setCustomId('select_style')
    .setPlaceholder('🎨 Change Visual Style')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Fill to Value').setValue('fill_value'),
      new StringSelectMenuOptionBuilder().setLabel('Bubble Chart').setValue('bubble'),
      new StringSelectMenuOptionBuilder().setLabel('Sparkline').setValue('sparkline'),
      new StringSelectMenuOptionBuilder().setLabel('Horizontal Bar').setValue('horizontal_bar'),
      new StringSelectMenuOptionBuilder().setLabel('Stepped Line').setValue('stepped_line'),
      new StringSelectMenuOptionBuilder().setLabel('Point Styles: Circle').setValue('point_circle'),
      new StringSelectMenuOptionBuilder().setLabel('Point Styles: Triangle').setValue('point_triangle'),
      new StringSelectMenuOptionBuilder().setLabel('Hide Axes, Gridlines & Gradient').setValue('hide_axes'),
      new StringSelectMenuOptionBuilder().setLabel('Boundaries (Line) No Fill').setValue('no_fill'),
      new StringSelectMenuOptionBuilder().setLabel('Formatted Numbers').setValue('formatted_numbers'),
      new StringSelectMenuOptionBuilder().setLabel('Vertical Axis Labels').setValue('vertical_axis')
    );
}

module.exports = { createStyleSelectMenu };
