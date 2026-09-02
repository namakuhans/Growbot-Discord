const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

function createMonitoringComponents(selectedTimeframe = '60', selectedStyle = 'fill_value') {
  const styleStr = String(selectedStyle);

  // Select Menu: Tampilan Gaya Chart
  const styleSelect = new StringSelectMenuBuilder()
    .setCustomId('select_style')
    .setPlaceholder('🎨 Pilih Gaya Visualisasi Chart...')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Fill to Value').setValue('fill_value').setDefault(styleStr === 'fill_value'),
      new StringSelectMenuOptionBuilder().setLabel('Bubble Chart').setValue('bubble').setDefault(styleStr === 'bubble'),
      new StringSelectMenuOptionBuilder().setLabel('Sparkline').setValue('sparkline').setDefault(styleStr === 'sparkline'),
      new StringSelectMenuOptionBuilder().setLabel('Horizontal Bar').setValue('horizontal_bar').setDefault(styleStr === 'horizontal_bar'),
      new StringSelectMenuOptionBuilder().setLabel('Stepped Line').setValue('stepped_line').setDefault(styleStr === 'stepped_line'),
      new StringSelectMenuOptionBuilder().setLabel('Point Styles: Circle').setValue('point_circle').setDefault(styleStr === 'point_circle'),
      new StringSelectMenuOptionBuilder().setLabel('Point Styles: Triangle').setValue('point_triangle').setDefault(styleStr === 'point_triangle'),
      new StringSelectMenuOptionBuilder().setLabel('Hide Axes, Gridlines & Gradient').setValue('hide_axes').setDefault(styleStr === 'hide_axes'),
      new StringSelectMenuOptionBuilder().setLabel('Boundaries (Line) No Fill').setValue('no_fill').setDefault(styleStr === 'no_fill'),
      new StringSelectMenuOptionBuilder().setLabel('Formatted Numbers').setValue('formatted_numbers').setDefault(styleStr === 'formatted_numbers'),
      new StringSelectMenuOptionBuilder().setLabel('Vertical Axis Labels').setValue('vertical_axis').setDefault(styleStr === 'vertical_axis')
    );

  const row = new ActionRowBuilder().addComponents(styleSelect);

  return [row];
}

module.exports = { createMonitoringComponents };
