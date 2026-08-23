const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

function createMonitoringComponents(selectedTimeframe = '60', selectedStyle = 'fill_value') {
  // Pastikan perbandingan bertipe String untuk menghindari mismatch angka vs string
  const timeframeStr = String(selectedTimeframe);
  const styleStr = String(selectedStyle);

  // Select Menu 1: Timeframe Selection
  const timeframeSelect = new StringSelectMenuBuilder()
    .setCustomId('select_timeframe')
    .setPlaceholder('⏱️ Pilih Timeframe Grafik...')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('1 Day').setValue('1440').setDefault(timeframeStr === '1440'),
      new StringSelectMenuOptionBuilder().setLabel('1 Hour').setValue('60').setDefault(timeframeStr === '60'),
      new StringSelectMenuOptionBuilder().setLabel('30 Minutes').setValue('30').setDefault(timeframeStr === '30'),
      new StringSelectMenuOptionBuilder().setLabel('15 Minutes').setValue('15').setDefault(timeframeStr === '15'),
      new StringSelectMenuOptionBuilder().setLabel('5 Minutes').setValue('5').setDefault(timeframeStr === '5'),
      new StringSelectMenuOptionBuilder().setLabel('3 Minutes').setValue('3').setDefault(timeframeStr === '3'),
      new StringSelectMenuOptionBuilder().setLabel('1 Minute').setValue('1').setDefault(timeframeStr === '1')
    );

  // Select Menu 2: Tampilan Gaya Chart
  const styleSelect = new StringSelectMenuBuilder()
    .setCustomId('select_style')
    .setPlaceholder('🎨 Pilih Gaya Visualisasi Chart...')
    .addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Fill to Value (Chart.js v3)').setValue('fill_value').setDefault(styleStr === 'fill_value'),
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

  const row1 = new ActionRowBuilder().addComponents(timeframeSelect);
  const row2 = new ActionRowBuilder().addComponents(styleSelect);

  return [row1, row2];
}

module.exports = { createMonitoringComponents };
